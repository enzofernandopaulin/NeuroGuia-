import React, { useState } from 'react';
import { updateResponsiblePassword } from '../services/authService';

interface Props {
  onDone: () => void;
}

export const ResetPassword: React.FC<Props> = ({ onDone }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('');

    if (password.length < 6) {
      setFeedback('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setFeedback('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await updateResponsiblePassword(password);
      setFeedback('Senha alterada com sucesso.');
      setTimeout(onDone, 700);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-5 py-10 flex items-center justify-center">
      <section className="w-full max-w-md bg-white rounded-3xl border border-outline-variant/60 shadow-sm p-6">
        <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">lock_reset</span>
        </div>
        <h1 className="text-2xl font-extrabold">Criar nova senha</h1>
        <p className="text-sm text-on-surface-variant mt-2 mb-5">Digite uma nova senha para sua conta de responsável.</p>

        <form onSubmit={submit} className="space-y-3">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Nova senha" className="w-full rounded-2xl border-2 border-outline-variant bg-surface-container-low px-4 py-3.5 outline-none focus:border-primary" />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder="Confirmar nova senha" className="w-full rounded-2xl border-2 border-outline-variant bg-surface-container-low px-4 py-3.5 outline-none focus:border-primary" />
          {feedback && <div className="rounded-2xl bg-surface-container-low p-3 text-sm font-bold">{feedback}</div>}
          <button disabled={loading} className="w-full rounded-2xl bg-primary text-white py-4 font-extrabold disabled:opacity-60">{loading ? 'Salvando...' : 'Salvar nova senha'}</button>
        </form>
      </section>
    </main>
  );
};

