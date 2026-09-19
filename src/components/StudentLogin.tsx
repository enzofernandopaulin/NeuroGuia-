import React, { useState } from 'react';
import { TeaProfileRow } from '../lib/database.types';
import { signInStudent } from '../services/studentAccessService';

interface Props { onLogin: (profile: TeaProfileRow) => void; onBack: () => void }

export const StudentLogin: React.FC<Props> = ({ onLogin, onBack }) => {
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setLoading(true);
    try { onLogin(await signInStudent(code, pin)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível entrar.'); }
    finally { setLoading(false); }
  };
  return <main className="min-h-screen max-w-md mx-auto px-5 py-10">
    <button onClick={onBack} className="text-primary font-bold mb-8">← Voltar</button>
    <h1 className="text-3xl font-extrabold">Acesso do estudante</h1>
    <p className="mt-2 mb-6 text-on-surface-variant">Use o código e o PIN fornecidos pelo responsável.</p>
    <form onSubmit={submit} className="bg-white rounded-3xl p-6 border space-y-4">
      <label className="block font-bold">Código<input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
        autoComplete="off" maxLength={12} required placeholder="Código de 12 caracteres"
        className="block w-full border-2 rounded-xl p-3 mt-2 uppercase" /></label>
      <label className="block font-bold">PIN<input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
        type="password" inputMode="numeric" maxLength={6} minLength={6} required autoComplete="off"
        className="block w-full border-2 rounded-xl p-3 mt-2" /></label>
      {error && <p role="alert" className="text-error text-sm font-bold">{error}</p>}
      <button disabled={loading} className="w-full bg-primary text-white font-extrabold rounded-xl p-4 disabled:opacity-50">
        {loading ? 'Verificando...' : 'Entrar'}
      </button>
      <p className="text-sm text-on-surface-variant">Esqueceu o PIN? Peça ao responsável para criar outro no painel.</p>
    </form>
  </main>;
};
