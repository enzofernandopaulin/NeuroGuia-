import { SupabaseClient } from '@supabase/supabase-js';
import { RoutineTask } from '../types';
import { requireSupabase } from '../lib/supabase';

export function localDay(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export async function loadRoutine(profileId: string, client: SupabaseClient = requireSupabase()): Promise<RoutineTask[]> {
  const { data: rows, error } = await client.from('routine_tasks')
    .select('id, title, task_time, category, sort_order').eq('profile_id', profileId)
    .order('sort_order').order('task_time');
  if (error) throw error;
  const taskRows = rows ?? [];
  if (!taskRows.length) return [];
  const ids = taskRows.map(row => row.id);
  const [stepsResult, completedResult] = await Promise.all([
    client.from('routine_steps').select('id, task_id, instruction, position')
      .in('task_id', ids).order('position'),
    client.from('routine_completions').select('task_id').in('task_id', ids).eq('day', localDay()),
  ]);
  if (stepsResult.error) throw stepsResult.error;
  if (completedResult.error) throw completedResult.error;
  const completed = new Set((completedResult.data ?? []).map(row => row.task_id));
  const steps = stepsResult.data ?? [];
  const stepIds = steps.map(step => step.id);
  const stepResult = stepIds.length
    ? await client.from('routine_step_completions').select('step_id').in('step_id', stepIds).eq('day', localDay())
    : { data: [], error: null };
  if (stepResult.error) throw stepResult.error;
  const doneSteps = new Set((stepResult.data ?? []).map(row => row.step_id));
  return taskRows.map(row => {
    const ownSteps = steps.filter(step => step.task_id === row.id);
    return {
      id: row.id, profileId, title: row.title, time: row.task_time?.slice(0, 5) ?? '',
      category: row.category, completed: completed.has(row.id),
      steps: ownSteps.map(step => step.instruction),
      stepIds: ownSteps.map(step => step.id),
      completedSteps: ownSteps.map(step => doneSteps.has(step.id)),
    };
  });
}

export async function saveRoutineTask(profileId: string, task: Pick<RoutineTask, 'title' | 'time' | 'category' | 'steps'> & { id?: string }): Promise<void> {
  const { error } = await requireSupabase().rpc('save_routine_task', {
    p_profile_id: profileId, p_task_id: task.id ?? null,
    p_title: task.title.trim(), p_time: task.time || null,
    p_category: task.category?.trim() || 'Rotina', p_steps: (task.steps ?? []).map(x => x.trim()).filter(Boolean),
  });
  if (error) throw error;
}

export async function deleteRoutineTask(id: string): Promise<void> {
  const { error } = await requireSupabase().rpc('delete_routine_task', { p_task_id: id });
  if (error) throw error;
}

export async function setRoutineCompleted(task: RoutineTask, completed: boolean, client: SupabaseClient = requireSupabase()): Promise<void> {
  if (completed) {
    const { error } = await client.from('routine_completions')
      .insert({ task_id: task.id, profile_id: task.profileId, day: localDay() });
    if (error && error.code !== '23505') throw error;
  } else {
    const { error } = await client.from('routine_completions').delete().eq('task_id', task.id).eq('day', localDay());
    if (error) throw error;
  }
}

export async function completeRoutineStep(stepId: string, client: SupabaseClient = requireSupabase()): Promise<void> {
  const { error } = await client.from('routine_step_completions')
    .insert({ step_id: stepId, day: localDay() });
  if (error && error.code !== '23505') throw error;
}
