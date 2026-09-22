import React, { useState } from 'react';
import { redeemStudentAccess } from '../services/studentAccessService';

interface Props {
  onBack: () => void;
  onAuthenticated: (profileId: string) => Promise<void> | void;
}

export const StudentLogin: React.FC<Props> = ({ onBack, onAuthenticated }) => {
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (code.replace(/\W/g, '').length !== 12 || !/^\d{6}$/.test(pin)) {
      setError('Digite o código de 12 caracteres e o PIN de 6 números.');
      return;
    }
    setLoading(true);
    try {
      const profileId = await redeemStudentAccess(code, pin);
      await onAuthenticated(profileId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível acessar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-5 py-10 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl bg-white border border-outline-variant/60 p-6 shadow-sm">
        <button type="button" onClick={onBack} className="text-sm font-bold text-primary mb-5">← Voltar</button>
        <div className="w-16 h-16 rounded-3xl bg-secondary-fixed text-secondary flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-3xl">meeting_room</span>
        </div>
        <h1 className="text-3xl font-extrabold">Acesso do estudante</h1>
        <p className="text-sm text-on-surface-variant mt-2 mb-6">Use o código e o PIN criados pelo responsável.</p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-bold">Código do estudante
            <input aria-label="Código do estudante" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))}
              placeholder="AB12CD34EF56" autoComplete="off" className="mt-2 w-full rounded-2xl border-2 border-outline-variant p-4 text-center text-lg font-extrabold tracking-widest uppercase" />
          </label>
          <label className="block text-sm font-bold">PIN
            <input aria-label="PIN" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000" inputMode="numeric" type="password" autoComplete="off" className="mt-2 w-full rounded-2xl border-2 border-outline-variant p-4 text-center text-xl font-extrabold tracking-[0.5em]" />
          </label>
          {error && <div role="alert" className="rounded-2xl bg-error-container text-on-error-container p-4 text-sm font-bold">{error}</div>}
          <button disabled={loading} className="w-full rounded-2xl bg-secondary text-white font-extrabold py-4 disabled:opacity-60">{loading ? 'Entrando...' : 'Acessar meu NeuroGuia'}</button>
        </form>
      </section>
    </main>
  );
};
