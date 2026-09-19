import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TeaProfileRow } from '../lib/database.types';
import { requireSupabase } from '../lib/supabase';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Separate auth storage avoids using a guardian token for student RPCs.
export const studentClient: SupabaseClient | null = url && key
  ? createClient(url, key, { auth: {
      storageKey: 'neuroguia-student-auth',
      storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
      persistSession: true, autoRefreshToken: true, detectSessionInUrl: false,
    } })
  : null;

function requireStudentClient(): SupabaseClient {
  if (!studentClient) throw new Error('Supabase não está configurado.');
  return studentClient;
}

export async function configureStudentAccess(profileId: string, pin: string): Promise<string> {
  const { data, error } = await requireSupabase().rpc('configure_student_access', {
    p_profile_id: profileId, p_pin: pin,
  });
  if (error) throw error;
  return data as string;
}

export async function getStudentAccessCode(profileId: string): Promise<string | null> {
  const { data, error } = await requireSupabase().rpc('get_student_access_code', {
    p_profile_id: profileId,
  });
  if (error) throw error;
  return data as string | null;
}

export async function getStudentProfile(): Promise<TeaProfileRow | null> {
  const client = requireStudentClient();
  const { data: session } = await client.auth.getSession();
  if (!session.session?.user.is_anonymous) return null;
  const { data: id, error } = await client.rpc('current_student_profile_id');
  if (error) throw error;
  if (!id) return null;
  const { data: profile, error: profileError } = await client.from('tea_profiles')
    .select('*').eq('id', id).single();
  if (profileError) throw profileError;
  return profile as TeaProfileRow;
}

export async function signInStudent(code: string, pin: string): Promise<TeaProfileRow> {
  const client = requireStudentClient();
  const { data: previous } = await client.auth.getSession();
  if (!previous.session?.user.is_anonymous) {
    const { error } = await client.auth.signInAnonymously();
    if (error) throw new Error('Acesso do estudante indisponível no momento. Peça ajuda ao responsável.');
  }
  const { data: id, error } = await client.rpc('redeem_student_access', {
    p_code: code.trim().toUpperCase(), p_pin: pin,
  });
  if (error) throw error;
  if (!id) throw new Error('Código ou PIN incorreto.');
  const profile = await getStudentProfile();
  if (!profile || profile.id !== id) throw new Error('Não foi possível carregar o estudante.');
  return profile;
}

export async function signOutStudent(): Promise<void> {
  const client = requireStudentClient();
  const { error: revokeError } = await client.rpc('revoke_student_access');
  const { error } = await client.auth.signOut();
  if (error) throw error;
  if (revokeError) throw revokeError;
}
