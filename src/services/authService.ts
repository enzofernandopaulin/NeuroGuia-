import { Session, User } from '@supabase/supabase-js';
import { requireSupabase, supabase } from '../lib/supabase';

function appUrl(): string {
  const configured = import.meta.env.VITE_APP_URL?.trim();
  if (configured && !configured.includes('SEU-PROJETO')) {
    return configured.replace(/\/$/, '');
  }
  return window.location.origin;
}

export interface SignUpResult {
  user: User | null;
  session: Session | null;
}

export async function signUpResponsible(
  name: string,
  email: string,
  password: string
): Promise<SignUpResult> {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: name.trim(),
        role: 'responsavel',
      },
    },
  });

  if (error) throw error;

  return {
    user: data.user,
    session: data.session,
  };
}

export async function signInResponsible(email: string, password: string) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOutResponsible(): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function sendPasswordReset(email: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: appUrl(),
  });
  if (error) throw error;
}

export async function updateResponsiblePassword(password: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.updateUser({ password });
  if (error) throw error;
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
