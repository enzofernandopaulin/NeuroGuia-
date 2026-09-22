import { requireStudentSupabase, requireSupabase } from '../lib/supabase';
import { TeaProfileRow } from '../lib/database.types';

export async function configureStudentAccess(profileId: string, pin: string): Promise<string> {
  if (!/^\d{6}$/.test(pin)) throw new Error('O PIN precisa ter exatamente 6 números.');
  const client = requireSupabase();
  const { data, error } = await client.rpc('configure_student_access', {
    p_profile_id: profileId,
    p_pin: pin,
  });
  if (error) throw error;
  return String(data);
}

export async function getStudentAccessCode(profileId: string): Promise<string | null> {
  const client = requireSupabase();
  const { data, error } = await client.rpc('get_student_access_code', {
    p_profile_id: profileId,
  });
  if (error) throw error;
  return data ? String(data) : null;
}

export async function redeemStudentAccess(code: string, pin: string): Promise<string> {
  const client = requireStudentSupabase();
  const current = await client.auth.getSession();
  if (!current.data.session) {
    const { error: authError } = await client.auth.signInAnonymously();
    if (authError) throw authError;
  }
  const cleanCode = code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const { data, error } = await client.rpc('redeem_student_access', {
    p_code: cleanCode,
    p_pin: pin,
  });
  if (error) throw error;
  if (!data) throw new Error('Código ou PIN incorreto. Confira os dados e tente novamente.');
  return String(data);
}

export async function getCurrentStudentProfile(): Promise<TeaProfileRow | null> {
  const client = requireStudentSupabase();
  const { data: profileId, error: sessionError } = await client.rpc('current_student_profile_id');
  if (sessionError || !profileId) return null;
  const { data, error } = await client.from('tea_profiles').select('*').eq('id', profileId).maybeSingle();
  if (error) throw error;
  return data as TeaProfileRow | null;
}

export async function leaveStudentRoom(): Promise<void> {
  const client = requireStudentSupabase();
  await client.rpc('revoke_student_access');
  await client.auth.signOut();
}
