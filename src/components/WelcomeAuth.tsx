import React, { useState } from 'react';
import { UserRole } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  sendPasswordReset,
  signInResponsible,
  signUpResponsible,
} from '../services/authService';

interface Props {
  onResponsibleAuthenticated: (name: string, isNewAccount: boolean) => void;
  onTeaAccess: () => void;
}

export const WelcomeAuth: React.FC<Props> = ({
  onResponsibleAuthenticated,
  onTeaAccess,
}) => {
  const [role, setRole] = useState<UserRole>('responsavel');
  const [tab, setTab] = useState<'entrar' | 'cadastrar'>('cadastrar');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (role === 'tea') {
      onTeaAccess();
      return;
    }

    if (!isSupabaseConfigured) {
      setFeedback({
        type: 'error',
        text: 'Supabase ainda não está configurado no Vercel. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
      });
      return;
    }

    if (!email.trim() || !password) {
      setFeedback({ type: 'error', text: 'Preencha e-mail e senha.' });
      return;
    }

    if (tab === 'cadastrar') {
      if (!name.trim()) {
        setFeedback({ type: 'error', text: 'Informe o nome do responsável.' });
        return;
      }
      if (password.length < 6) {
        setFeedback({ type: 'error', text: 'A senha precisa ter pelo menos 6 caracteres.' });
        return;
      }
      if (!accepted) {
        setFeedback({ type: 'error', text: 'Aceite os termos para criar a conta.' });
        return;
      }
    }

    setLoading(true);
    try {
      if (tab === 'cadastrar') {
        const result = await signUpResponsible(name, email, password);
        if (result.needsEmailConfirmation) {
          setFeedback({
            type: 'success',
            text: 'Conta criada. Confira seu e-mail para confirmar o cadastro antes de entrar.',
          });
          setTab('entrar');
          setPassword('');
        } else {
          onResponsibleAuthenticated(name, true);
        }
      } else {
        const data = await signInResponsible(email, password);
        const displayName =
          String(data.user?.user_metadata?.full_name || '').trim() ||
          data.user?.email?.split('@')[0] ||
          'Responsável';
        onResponsibleAuthenticated(displayName, false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível concluir a autenticação.';
      setFeedback({ type: 'error', text: message });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setFeedback(null);
    if (!email.trim()) {
      setFeedback({ type: 'error', text: 'Digite seu e-mail primeiro.' });
      return;
    }
    if (!isSupabaseConfigured) {
      setFeedback({ type: 'error', text: 'Supabase ainda não está configurado.' });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email);
      setFeedback({
        type: 'success',
        text: 'Enviamos um link de recuperação para o e-mail informado.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível enviar o link.';
      setFeedback({ type: 'error', text: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-5 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-3xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-3xl">diversity_1</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">NeuroGuia</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Rotina, autonomia e apoio de um jeito mais previsível.
          </p>
        </div>

        <section className="bg-white rounded-3xl border border-outline-variant/60 shadow-sm p-5">
          <div className="grid grid-cols-2 gap-2 bg-surface-container-low rounded-2xl p-1.5 mb-5">
            <button type="button" onClick={() => { setTab('entrar'); setFeedback(null); }} className={`py-3 rounded-xl font-bold text-sm ${tab === 'entrar' ? 'bg-white shadow-sm' : 'text-on-surface-variant'}`}>Entrar</button>
            <button type="button" onClick={() => { setTab('cadastrar'); setFeedback(null); }} className={`py-3 rounded-xl font-bold text-sm ${tab === 'cadastrar' ? 'bg-white shadow-sm' : 'text-on-surface-variant'}`}>Criar conta</button>
          </div>

          <p className="text-xs font-bold uppercase tracking-wider text-outline mb-2">Quem está acessando?</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button type="button" onClick={() => { setRole('responsavel'); setFeedback(null); }} className={`rounded-2xl border-2 p-4 text-left transition-all ${role === 'responsavel' ? 'border-primary bg-primary-fixed' : 'border-outline-variant bg-surface-container-low'}`}>
              <span className="material-symbols-outlined text-3xl">family_restroom</span>
              <div className="font-extrabold mt-2">Responsável</div>
              <div className="text-xs text-on-surface-variant mt-1">Conta protegida pelo Supabase Auth.</div>
            </button>

            <button type="button" onClick={() => { setRole('tea'); setFeedback(null); }} className={`rounded-2xl border-2 p-4 text-left transition-all ${role === 'tea' ? 'border-secondary bg-secondary-fixed' : 'border-outline-variant bg-surface-container-low'}`}>
              <span className="material-symbols-outlined text-3xl">sentiment_satisfied</span>
              <div className="font-extrabold mt-2">TEA</div>
              <div className="text-xs text-on-surface-variant mt-1">Vínculo seguro será feito no tópico 3.</div>
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {role === 'responsavel' && tab === 'cadastrar' && (
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Nome do responsável" className="w-full rounded-2xl border-2 border-outline-variant bg-surface-container-low px-4 py-3.5 outline-none focus:border-primary" />
            )}

            {role === 'responsavel' && (
              <>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="E-mail" className="w-full rounded-2xl border-2 border-outline-variant bg-surface-container-low px-4 py-3.5 outline-none focus:border-primary" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete={tab === 'entrar' ? 'current-password' : 'new-password'} placeholder="Senha" className="w-full rounded-2xl border-2 border-outline-variant bg-surface-container-low px-4 py-3.5 outline-none focus:border-primary" />

                {tab === 'entrar' && (
                  <button type="button" onClick={resetPassword} disabled={loading} className="text-sm font-bold text-primary hover:underline disabled:opacity-50">
                    Esqueci minha senha
                  </button>
                )}
              </>
            )}

            {role === 'tea' && (
              <div className="rounded-2xl bg-secondary-fixed/60 p-4 text-sm">
                O acesso TEA ainda é temporário nesta etapa. O código de vínculo com o responsável será implementado no tópico 3.
              </div>
            )}

            {role === 'responsavel' && tab === 'cadastrar' && (
              <label className="flex gap-2 items-start text-xs text-on-surface-variant">
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5" />
                <span>Concordo com o uso dos dados necessários para autenticação, personalização e funcionamento do aplicativo.</span>
              </label>
            )}

            {feedback && (
              <div className={`rounded-2xl p-3 text-sm font-bold ${feedback.type === 'error' ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed text-on-tertiary-fixed'}`}>
                {feedback.text}
              </div>
            )}

            <button disabled={loading} className="w-full rounded-2xl bg-primary text-white font-extrabold py-4 shadow-sm disabled:opacity-60">
              {loading ? 'Aguarde...' : role === 'responsavel' ? (tab === 'cadastrar' ? 'Criar conta' : 'Entrar') : 'Entrar no meu NeuroGuia'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};
