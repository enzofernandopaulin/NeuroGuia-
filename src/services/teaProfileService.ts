import { TeaProfile } from '../types';
import { requireSupabase } from '../lib/supabase';
import { TeaProfileInsert, TeaProfileRow, TeaProfileUpdate } from '../lib/database.types';

export function mapTeaProfileRow(row: TeaProfileRow): TeaProfile {
  return {
    name: row.name,
    ageGroup: row.age_group,
    supportLevel: row.support_level,
    communicationPreference: row.communication_preference,
    autonomy: row.autonomy,
    sensoryTriggers: row.sensory_triggers ?? [],
    routineChangeDifficulty: row.routine_change_difficulty,
    softVisualMode: row.soft_visual_mode,
    stepByStep: row.step_by_step,
    helpButton: row.help_button,
    routineChangeWarning: row.routine_change_warning,
    maxLaterTasks: row.max_later_tasks,
    largeText: row.large_text,
    reduceMotion: row.reduce_motion,
    audioInstructions: row.audio_instructions,
  };
}

export function mapTeaProfileToInsert(
  profile: TeaProfile,
  responsibleId: string
): TeaProfileInsert {
  return {
    responsible_id: responsibleId,
    name: profile.name.trim(),
    avatar_url: null,
    age_group: profile.ageGroup,
    support_level: profile.supportLevel,
    communication_preference: profile.communicationPreference,
    autonomy: profile.autonomy,
    sensory_triggers: profile.sensoryTriggers,
    routine_change_difficulty: profile.routineChangeDifficulty,
    soft_visual_mode: profile.softVisualMode,
    step_by_step: profile.stepByStep,
    help_button: profile.helpButton,
    routine_change_warning: profile.routineChangeWarning,
    max_later_tasks: profile.maxLaterTasks,
    large_text: profile.largeText,
    reduce_motion: profile.reduceMotion,
    audio_instructions: profile.audioInstructions,
  };
}

export function mapTeaProfileToUpdate(profile: TeaProfile): TeaProfileUpdate {
  return {
    name: profile.name.trim(),
    age_group: profile.ageGroup,
    support_level: profile.supportLevel,
    communication_preference: profile.communicationPreference,
    autonomy: profile.autonomy,
    sensory_triggers: profile.sensoryTriggers,
    routine_change_difficulty: profile.routineChangeDifficulty,
    soft_visual_mode: profile.softVisualMode,
    step_by_step: profile.stepByStep,
    help_button: profile.helpButton,
    routine_change_warning: profile.routineChangeWarning,
    max_later_tasks: profile.maxLaterTasks,
    large_text: profile.largeText,
    reduce_motion: profile.reduceMotion,
    audio_instructions: profile.audioInstructions,
  };
}

export async function listTeaProfiles(): Promise<TeaProfileRow[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('tea_profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as TeaProfileRow[];
}

export async function getTeaProfile(id: string): Promise<TeaProfileRow | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('tea_profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as TeaProfileRow | null;
}

export async function createTeaProfile(
  profile: TeaProfile,
  responsibleId: string
): Promise<TeaProfileRow> {
  const supabase = requireSupabase();
  const payload = mapTeaProfileToInsert(profile, responsibleId);

  const { data, error } = await supabase
    .from('tea_profiles')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data as TeaProfileRow;
}

export async function updateTeaProfile(
  id: string,
  changes: TeaProfileUpdate
): Promise<TeaProfileRow> {
  const supabase = requireSupabase();

  const { data, error } = await supabase
    .from('tea_profiles')
    .update(changes)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as TeaProfileRow;
}

export async function deleteTeaProfile(id: string): Promise<void> {
  const supabase = requireSupabase();

  const { error } = await supabase
    .from('tea_profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
