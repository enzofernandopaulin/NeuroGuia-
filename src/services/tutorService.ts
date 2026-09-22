import { requireSupabase } from '../lib/supabase';
import { TeaProfileRow } from '../lib/database.types';
import { mapTeaProfileRow } from './teaProfileService';
import { TutorAssignment } from '../types';

export async function inviteTutor(profileId: string, email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalized)) throw new Error('Informe um e-mail válido.');
  const { error } = await requireSupabase().from('tutor_links').upsert({
    profile_id: profileId, tutor_email: normalized,
  }, { onConflict: 'profile_id,tutor_email' });
  if (error) throw error;
}

export async function listTutorAssignments(): Promise<TutorAssignment[]> {
  const { data, error } = await requireSupabase().from('tutor_links')
    .select('id, profile_id, tutor_email, tea_profiles(*)');
  if (error) throw error;
  return (data || []).flatMap((row) => {
    const profile = row.tea_profiles as unknown as TeaProfileRow | null;
    return profile ? [{ id: row.id, profileId: row.profile_id, tutorEmail: row.tutor_email, profile: mapTeaProfileRow(profile) }] : [];
  });
}
