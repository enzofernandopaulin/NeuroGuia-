import { SupabaseClient } from '@supabase/supabase-js';
import { requireSupabase, requireStudentSupabase } from '../lib/supabase';
import { RoutineChangeNotice, RoutineTask, SupportRequest, SupportRequestKind } from '../types';

type TaskRow = {
  id: string; profile_id: string; title: string; task_time: string | null;
  category: string | null; steps: string[] | null; completed: boolean;
  scheduled_date: string; updated_at: string;
  sort_order?: number; recurrence_days?: number[]; archived?: boolean;
};

const mapTask = (row: TaskRow): RoutineTask => ({
  id: row.id, profileId: row.profile_id, title: row.title,
  time: row.task_time?.slice(0, 5) || 'Sem horário', category: row.category || 'Rotina',
  steps: row.steps || [], completed: row.completed, scheduledDate: row.scheduled_date,
  updatedAt: row.updated_at,
  sortOrder: row.sort_order || 0, recurrenceDays: row.recurrence_days || [], archived: Boolean(row.archived),
});

async function listTasksWith(client: SupabaseClient, profileId: string): Promise<RoutineTask[]> {
  const { data, error } = await client.from('routine_tasks').select('*').eq('profile_id', profileId).eq('archived', false)
    .order('scheduled_date', { ascending: true }).order('sort_order', { ascending: true }).order('task_time', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data || []).map((row) => mapTask(row as TaskRow));
}

export const listResponsibleTasks = (profileId: string) => listTasksWith(requireSupabase(), profileId);
export const listStudentTasks = (profileId: string) => listTasksWith(requireStudentSupabase(), profileId);

export async function createRoutineTask(profileId: string, title: string, time: string, steps: string[], scheduledDate?: string, recurrenceDays: number[] = []) {
  const client = requireSupabase();
  const { data, error } = await client.from('routine_tasks').insert({
    profile_id: profileId, title: title.trim(), task_time: time || null,
    steps: steps.filter(Boolean), category: 'Rotina', scheduled_date: scheduledDate || new Date().toISOString().slice(0, 10), recurrence_days: recurrenceDays,
  }).select('*').single();
  if (error) throw error;
  return mapTask(data as TaskRow);
}

export async function updateRoutineTask(taskId: string, changes: {title?: string; task_time?: string | null; steps?: string[]; scheduled_date?: string; recurrence_days?: number[]; sort_order?: number}) {
  const { error } = await requireSupabase().from('routine_tasks').update(changes).eq('id', taskId);
  if (error) throw error;
}

export async function archiveRoutineTask(taskId: string) {
  const { error } = await requireSupabase().from('routine_tasks').update({ archived: true }).eq('id', taskId);
  if (error) throw error;
}

export async function setTaskCompleted(taskId: string, completed: boolean, student = false) {
  const client = student ? requireStudentSupabase() : requireSupabase();
  if (student) {
    const { error } = await client.rpc('set_student_task_completed', { p_task_id: taskId, p_completed: completed });
    if (error) throw error;
    return;
  }
  const { error } = await client.from('routine_tasks').update({ completed }).eq('id', taskId);
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
