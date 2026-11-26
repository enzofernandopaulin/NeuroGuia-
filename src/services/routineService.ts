import { SupabaseClient } from '@supabase/supabase-js';
import { requireSupabase, requireStudentSupabase } from '../lib/supabase';
import { PictogramSelection, RoutineChangeNotice, RoutineTask, SupportRequest, SupportRequestKind } from '../types';
import { localDate, occursOn } from '../lib/routineDates';
import { getArasaacImageUrl } from './arasaacService';

type TaskRow = {
  id: string; profile_id: string; title: string; task_time: string | null;
  category: string | null; steps: string[] | null; completed: boolean;
  scheduled_date: string; updated_at: string;
  sort_order?: number; recurrence_days?: number[]; archived?: boolean;
  duration_minutes?: number | null;
  pictogram_provider?: string | null;
  pictogram_id?: number | null;
  pictogram_label?: string | null;
  pictograms?: unknown;
};

const mapPictograms = (row: TaskRow): PictogramSelection[] => {
  if (Array.isArray(row.pictograms) && row.pictograms.length) return row.pictograms.flatMap((item) =>
    item && item.provider === 'arasaac' && Number.isInteger(item.id) && item.id > 0 && typeof item.label === 'string'
      ? [{ provider: 'arasaac' as const, id: item.id as number, label: item.label, imageUrl: getArasaacImageUrl(item.id) }] : []);
  return row.pictogram_id ? [{ provider: 'arasaac', id: row.pictogram_id,
    label: row.pictogram_label || row.title, imageUrl: getArasaacImageUrl(row.pictogram_id) }] : [];
};

const mapTask = (row: TaskRow): RoutineTask => ({
  id: row.id, profileId: row.profile_id, title: row.title,
  time: row.task_time?.slice(0, 5) || 'Sem horário', category: row.category || 'Rotina',
  steps: row.steps || [], completed: row.completed, scheduledDate: row.scheduled_date,
  updatedAt: row.updated_at,
  sortOrder: row.sort_order || 0, recurrenceDays: row.recurrence_days || [], archived: Boolean(row.archived),
  durationMinutes: row.duration_minutes ?? null,
  pictogramProvider: row.pictogram_provider === 'arasaac' ? 'arasaac' : null,
  pictogramId: row.pictogram_id ?? null,
  pictogramLabel: row.pictogram_label ?? null,
  pictograms: mapPictograms(row),
});

async function listTasksWith(client: SupabaseClient, profileId: string, date = localDate()): Promise<RoutineTask[]> {
  const { data, error } = await client.from('routine_tasks').select('*').eq('profile_id', profileId).eq('archived', false)
    .order('scheduled_date', { ascending: true }).order('sort_order', { ascending: true }).order('task_time', { ascending: true, nullsFirst: false });
  if (error) throw error;
  const tasks = (data || []).map((row) => mapTask(row as TaskRow)).filter((task) => occursOn(task, date));
  if (!tasks.length) return tasks;
  const { data: completions, error: completionError } = await client.from('routine_task_completions')
    .select('task_id').eq('profile_id', profileId).eq('occurrence_date', date);
  if (completionError) throw completionError;
  const completedIds = new Set((completions || []).map((item) => item.task_id));
  return tasks.map((task) => ({ ...task, completed: completedIds.has(task.id) }));
}

export const listResponsibleTasks = (profileId: string, date?: string) => listTasksWith(requireSupabase(), profileId, date);
export const listStudentTasks = (profileId: string, date?: string) => listTasksWith(requireStudentSupabase(), profileId, date);

export async function createRoutineTask(profileId: string, title: string, time: string, steps: string[], scheduledDate?: string, recurrenceDays: number[] = [], durationMinutes?: number | null, pictograms: PictogramSelection[] = []) {
  const client = requireSupabase();
  const { data, error } = await client.from('routine_tasks').insert({
    profile_id: profileId, title: title.trim(), task_time: time || null,
    steps: steps.filter(Boolean), category: 'Rotina', scheduled_date: scheduledDate || new Date().toISOString().slice(0, 10), recurrence_days: recurrenceDays,
    duration_minutes: durationMinutes || null,
    pictograms: pictograms.map(({provider,id,label}) => ({provider,id,label:label.trim().slice(0,120)})),
    pictogram_provider: pictograms[0]?.provider || null,
    pictogram_id: pictograms[0]?.id || null,
    pictogram_label: pictograms[0]?.label.trim().slice(0,120) || null,
  }).select('*').single();
  if (error) throw error;
  return mapTask(data as TaskRow);
}

export async function updateRoutineTask(taskId: string, changes: {title?: string; task_time?: string | null; steps?: string[]; scheduled_date?: string; recurrence_days?: number[]; sort_order?: number; duration_minutes?: number | null; pictogram_provider?: 'arasaac' | null; pictogram_id?: number | null; pictogram_label?: string | null; pictograms?: {provider:'arasaac';id:number;label:string}[]}) {
  const { error } = await requireSupabase().from('routine_tasks').update(changes).eq('id', taskId);
  if (error) throw error;
}

export async function setTutorTaskDuration(taskId: string, durationMinutes: number | null) {
  const { error } = await requireSupabase().rpc('set_tutor_task_duration', {
    p_task_id: taskId,
    p_duration_minutes: durationMinutes,
  });
  if (error) throw error;
}

export async function archiveRoutineTask(taskId: string) {
  const { error } = await requireSupabase().from('routine_tasks').update({ archived: true }).eq('id', taskId);
  if (error) throw error;
}

export async function setTaskCompleted(taskId: string, completed: boolean, date: string, student = false, profileId?: string) {
  const client = student ? requireStudentSupabase() : requireSupabase();
  if (student) {
    const { error } = await client.rpc('set_student_task_occurrence_completed', { p_task_id: taskId, p_date: date, p_completed: completed });
    if (error) throw error;
    return;
  }
  if (!profileId) throw new Error('Perfil do estudante não encontrado.');
  const { error } = completed
    ? await client.from('routine_task_completions').upsert({ task_id: taskId, profile_id: profileId, occurrence_date: date }, { onConflict: 'task_id,occurrence_date' })
    : await client.from('routine_task_completions').delete().eq('task_id', taskId).eq('profile_id', profileId).eq('occurrence_date', date);
  if (error) throw error;
}

export async function createSupportRequest(profileId: string, taskId: string | undefined, kind: SupportRequestKind, message: string) {
  const client = requireStudentSupabase();
  const { error } = await client.from('support_requests').insert({
    profile_id: profileId, task_id: taskId || null, kind, message,
  });
  if (error) throw error;
}

export async function listSupportRequests(profileId: string): Promise<SupportRequest[]> {
  const { data, error } = await requireSupabase().from('support_requests').select('*')
    .eq('profile_id', profileId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id, profileId: row.profile_id, taskId: row.task_id, kind: row.kind,
    message: row.message, status: row.status, createdAt: row.created_at,
  }));
}

export async function resolveSupportRequest(id: string) {
  const { error } = await requireSupabase().from('support_requests').update({ status: 'resolvido' }).eq('id', id);
  if (error) throw error;
}

export async function markSupportRequestViewed(id: string) {
  const { error } = await requireSupabase().from('support_requests').update({ status: 'visualizado', viewed_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function createRoutineChange(profileId: string, title: string, description: string, effectiveAt: string) {
  const { error } = await requireSupabase().from('routine_change_notices').insert({
    profile_id: profileId, title, description, effective_at: effectiveAt,
  });
  if (error) throw error;
}

async function listChangesWith(client: SupabaseClient, profileId: string): Promise<RoutineChangeNotice[]> {
  const { data, error } = await client.from('routine_change_notices').select('*').eq('profile_id', profileId)
    .order('effective_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id, profileId: row.profile_id, title: row.title, description: row.description,
    effectiveAt: row.effective_at, acknowledged: row.acknowledged,
  }));
}

export const listResponsibleChanges = (profileId: string) => listChangesWith(requireSupabase(), profileId);
export const listStudentChanges = (profileId: string) => listChangesWith(requireStudentSupabase(), profileId);

export async function acknowledgeRoutineChange(id: string) {
  const { error } = await requireStudentSupabase().rpc('acknowledge_student_change', { p_notice_id: id });
  if (error) throw error;
}
