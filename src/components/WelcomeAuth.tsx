import React, { useState } from 'react';
import { UserRole } from '../types';

interface Props {
  onAccess: (role: UserRole, name: string, isNewAccount: boolean) => void;
}

export const WelcomeAuth: React.FC<Props> = ({ onAccess }) => {
  const [role, setRole] = useState<UserRole>('responsavel');
  const [tab, setTab] = useState<'entrar' | 'cadastrar'>('cadastrar');
  const [name, setName] = useState('');
  const [accepted, setAccepted] = useState(true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) return;
    onAccess(role, name, tab === 'cadastrar');
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
            <button onClick={() => setTab('entrar')} className={`py-3 rounded-xl font-bold text-sm ${tab === 'entrar' ? 'bg-white shadow-sm' : 'text-on-surface-variant'}`}>
              Entrar
            </button>
            <button onClick={() => setTab('cadastrar')} className={`py-3 rounded-xl font-bold text-sm ${tab === 'cadastrar' ? 'bg-white shadow-sm' : 'text-on-surface-variant'}`}>
              Criar conta
            </button>
          </div>

          <p className="text-xs font-bold uppercase tracking-wider text-outline mb-2">Quem está acessando?</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => setRole('responsavel')}
              className={`rounded-2xl border-2 p-4 text-left transition-all ${role === 'responsavel' ? 'border-primary bg-primary-fixed' : 'border-outline-variant bg-surface-container-low'}`}
            >
              <span className="material-symbols-outlined text-3xl">family_restroom</span>
              <div className="font-extrabold mt-2">Responsável</div>
              <div className="text-xs text-on-surface-variant mt-1">Configura rotina e acompanha.</div>
            </button>

            <button
              type="button"
              onClick={() => setRole('tea')}
              className={`rounded-2xl border-2 p-4 text-left transition-all ${role === 'tea' ? 'border-secondary bg-secondary-fixed' : 'border-outline-variant bg-surface-container-low'}`}
            >
              <span className="material-symbols-outlined text-3xl">sentiment_satisfied</span>
              <div className="font-extrabold mt-2">TEA</div>
              <div className="text-xs text-on-surface-variant mt-1">Vê tarefas e pede ajuda.</div>
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {role === 'responsavel' && tab === 'cadastrar' && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full rounded-2xl border-2 border-outline-variant bg-surface-container-low px-4 py-3.5 outline-none focus:border-primary"
              />
            )}

            {role === 'responsavel' && (
              <>
                <input type="email" placeholder="E-mail" className="w-full rounded-2xl border-2 border-outline-variant bg-surface-container-low px-4 py-3.5 outline-none focus:border-primary" />
                <input type="password" placeholder="Senha" className="w-full rounded-2xl border-2 border-outline-variant bg-surface-container-low px-4 py-3.5 outline-none focus:border-primary" />
              </>
            )}

            {role === 'tea' && (
              <div className="rounded-2xl bg-secondary-fixed/60 p-4 text-sm">
                No MVP, o acesso TEA abre a experiência simplificada vinculada ao perfil configurado pelo responsável.
              </div>
            )}

            <label className="flex gap-2 items-start text-xs text-on-surface-variant">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5" />
              <span>Concordo com o uso dos dados necessários para personalização e funcionamento do aplicativo.</span>
            </label>

            <button className="w-full rounded-2xl bg-primary text-white font-extrabold py-4 shadow-sm">
              {role === 'responsavel' ? (tab === 'cadastrar' ? 'Criar conta e personalizar' : 'Entrar') : 'Entrar no meu NeuroGuia'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-outline-variant/50 text-center">
            <span className="text-xs text-outline">Tutor será conectado em uma próxima etapa do projeto.</span>
          </div>
        </section>
      </div>
    </main>
  );
};
