import React, { useEffect, useState } from 'react';
import { configureStudentAccess, getStudentAccessCode } from '../services/studentAccessService';

interface Props { profileId: string; profileName: string }

export const StudentAccessSettings: React.FC<Props> = ({ profileId, profileName }) => {
  const [code, setCode] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    setCode(null); setMessage('');
    getStudentAccessCode(profileId).then(value => { if (active) setCode(value); })
      .catch(() => { if (active) setMessage('Não foi possível carregar o código.'); });
    return () => { active = false; };
  }, [profileId]);
  const save = async () => {
    if (!/^\d{6}$/.test(pin)) { setMessage('Escolha um PIN de seis dígitos.'); return; }
    setSaving(true); setMessage('');
    try {
      setCode(await configureStudentAccess(profileId, pin));
      setPin(''); setMessage('Acesso configurado. O PIN anterior deixou de funcionar.');
    } catch { setMessage('Não foi possível salvar o acesso. Peça ao administrador do projeto para conferir a configuração.'); }
    finally { setSaving(false); }
  };
  return <section className="bg-white rounded-3xl border p-5 mt-5">
    <h2 className="text-xl font-extrabold">Acesso de {profileName}</h2>
    <p className="text-sm text-on-surface-variant mt-1">Entregue o código e o PIN apenas ao estudante e a quem o acompanha.</p>
    {code && <p className="mt-4 font-bold">Código: <span className="font-mono select-all">{code}</span></p>}
    <label className="block mt-4 font-bold">{code ? 'Definir novo PIN' : 'Criar PIN'}
      <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
        maxLength={6} inputMode="numeric" type="password" autoComplete="new-password"
        className="block mt-2 border-2 rounded-xl p-3 w-full max-w-xs" placeholder="Seis dígitos" />
    </label>
    <button onClick={save} disabled={saving} className="mt-3 rounded-xl bg-primary text-white px-5 py-3 font-bold disabled:opacity-50">
      {saving ? 'Salvando...' : code ? 'Redefinir PIN' : 'Ativar acesso'}
    </button>
    {message && <p role="status" className="mt-3 text-sm">{message}</p>}
  </section>;
};
