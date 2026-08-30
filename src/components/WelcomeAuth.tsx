import React, { useState } from 'react';
import { AppView, UserRole, UserAccessMode } from '../types';

interface WelcomeAuthProps {
  onLoginSuccess: (role: UserRole, name: string, mode: UserAccessMode) => void;
  setCurrentView: (view: AppView) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const WelcomeAuth: React.FC<WelcomeAuthProps> = ({
  onLoginSuccess,
  setCurrentView,
  role,
  setRole,
}) => {
  const [tab, setTab] = useState<'entrar' | 'cadastrar'>('cadastrar');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // LGPD Privacy Terms state
  const [lgpdAccepted, setLgpdAccepted] = useState(true);
  const [lgpdError, setLgpdError] = useState(false);
  const [showLgpdModal, setShowLgpdModal] = useState(false);

  // Email form login -> Connected Mode with Internet & Full Sidebar
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lgpdAccepted) {
      setLgpdError(true);
      return;
    }
    setLgpdError(false);
    const displayName = name.trim() || (role === 'anfitriao' || role === 'tutor' ? 'Anfitrião Alex' : 'Membro Alex');
    onLoginSuccess(role, displayName, 'conectado');
  };

  // Autonomous button -> Dedicated Offline Mode with empty sidebar
  const handleAutonomousAccess = () => {
    if (!lgpdAccepted) {
      setLgpdError(true);
      return;
    }
    setLgpdError(false);
    onLoginSuccess('estudante', 'Estudante Autônomo', 'autonomo');
    setCurrentView('autonomo-view');
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 flex flex-col items-center justify-center max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center flex flex-col items-center mb-6">
        <div className="w-28 h-28 mb-3 flex items-center justify-center">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUpooMIPjPEsJRFz-3De23CyV0iSxEFM37o-GvopeInJYjVjBnArvi-bBxAdifQdn12T39bbEC49RvjM5s5SG8h4vVsEOpszXgcN7IJFCgnTNvapakubDvlDdsaMmo9U9F2cCtrVNWypKM8tZPdFxKnoQBPigpjYU4abs8x86NcWysMwnz7YCyMAIdHLMdISmay5zeKwicTYxqCOUlqW6fphH3VZVxF_cLsZKxAylwG3HJlHP0rZc1eabKJ7ta0DurQA"
            alt="Logo NeuroGuia"
            className="w-full h-full object-contain animate-float"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-2xl font-bold text-on-surface mb-2 tracking-tight">
          Olá! Bem-vindo ao NeuroGuia
        </h1>
        <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
          Escolha como prefere usar a plataforma hoje:
        </p>
      </div>

      {/* Access Mode Selector Option Box */}
      <div className="w-full mb-4 bg-surface-container-lowest p-3 rounded-2xl border-2 border-outline-variant/60 flex flex-col gap-2">
        <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-1">
          Selecione seu Modo de Acesso:
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAutonomousAccess}
            className="p-3 rounded-xl bg-tertiary-container/30 border border-tertiary-container text-on-tertiary-container hover:bg-tertiary-container/50 text-left transition-all cursor-pointer flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-tertiary">
              <span className="material-symbols-outlined text-[16px]">laptop</span>
              <span>Modo Autônomo</span>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-snug">
              Sem login • Sidebar vazia local
            </p>
          </button>

          <div className="p-3 rounded-xl bg-primary-container/30 border border-primary-container text-on-primary-container text-left flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
              <span className="material-symbols-outlined text-[16px]">mail</span>
              <span>Modo E-mail</span>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-snug">
              Com e-mail • Turmas e sidebar normal
            </p>
          </div>
        </div>
      </div>

      {/* Main Auth Card (Modo Conectado por E-mail) */}
      <div className="w-full bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-outline-variant/60 flex flex-col gap-5">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
          <h2 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">mail</span>
            <span>Acesso por E-mail</span>
          </h2>
          <span className="text-[10px] font-bold text-tertiary bg-tertiary-container/40 px-2 py-0.5 rounded-full">
            Completo
          </span>
        </div>

        {/* Auth Mode Toggle Pill */}
        <div className="bg-surface-container-high p-1.5 rounded-full flex items-center">
          <button
            type="button"
            onClick={() => setTab('entrar')}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === 'entrar'
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setTab('cadastrar')}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === 'cadastrar'
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* Role Selector */}
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Eu sou um(a):
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('membro')}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'membro' || role === 'estudante'
                  ? 'bg-secondary-container/40 border-secondary-container text-on-secondary-container shadow-sm'
                  : 'bg-surface-container-low border-outline-variant/60 text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">person</span>
              <span className="font-bold text-sm">Membro</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('anfitriao')}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'anfitriao' || role === 'tutor'
                  ? 'bg-primary-container/40 border-primary-container text-on-primary-container shadow-sm'
                  : 'bg-surface-container-low border-outline-variant/60 text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">stars</span>
              <span className="font-bold text-sm">Anfitrião</span>
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mt-1">
          {tab === 'cadastrar' && (
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                person
              </span>
              <input
                type="text"
                placeholder="Como quer ser chamado?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-2 border-outline-variant/60 rounded-2xl text-on-surface placeholder:text-outline text-sm font-medium focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>
          )}

          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              mail
            </span>
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-2 border-outline-variant/60 rounded-2xl text-on-surface placeholder:text-outline text-sm font-medium focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
            />
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              lock
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={tab === 'cadastrar' ? 'Crie uma senha forte' : 'Sua senha'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low border-2 border-outline-variant/60 rounded-2xl text-on-surface placeholder:text-outline text-sm font-medium focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {/* Checkbox Obrigatório LGPD */}
          <div className="flex flex-col gap-1 my-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-on-surface-variant font-medium select-none">
              <input
                type="checkbox"
                checked={lgpdAccepted}
                onChange={(e) => {
                  setLgpdAccepted(e.target.checked);
                  if (e.target.checked) setLgpdError(false);
                }}
                className="mt-0.5 w-4 h-4 rounded border-2 border-outline text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
              />
              <span>
                Li e aceito os{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowLgpdModal(true);
                  }}
                  className="text-primary font-bold underline hover:text-primary/80 cursor-pointer"
                >
                  Termos de Privacidade e Proteção de Dados (LGPD)
                </button>
                .
              </span>
            </label>
            {lgpdError && (
              <p className="text-[11px] font-bold text-error flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px]">error</span>
                <span>É obrigatório aceitar a Política de Privacidade (LGPD) para continuar.</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 bg-primary text-on-primary font-bold text-base py-4 rounded-2xl border-b-4 border-on-primary-fixed-variant active:border-b-0 active:translate-y-1 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">login</span>
            <span>{tab === 'cadastrar' ? 'Criar Conta Conectada' : 'Entrar com E-mail'}</span>
          </button>
        </form>

        {/* Autonomous Access Direct Button */}
        <div className="text-center pt-2 border-t border-surface-variant flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={handleAutonomousAccess}
            className="inline-flex items-center gap-2 text-tertiary font-bold text-sm hover:underline p-2 rounded-xl transition-colors active:bg-tertiary-container/30 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">laptop</span>
            <span>Entrar em Modo Autônomo</span>
          </button>
          <span className="text-[10px] text-outline">Acesso direto com ferramentas locais</span>
        </div>
      </div>

      {/* Footer Legal Terms */}
      <p className="text-xs text-on-surface-variant text-center mt-6">
        Ao se cadastrar ou navegar, você concorda com nossos{' '}
        <button
          type="button"
          onClick={() => setShowLgpdModal(true)}
          className="underline font-semibold text-primary hover:text-primary/80 cursor-pointer"
        >
          Termos de Privacidade (LGPD - Lei nº 13.709/2018)
        </button>
        .
      </p>

      {/* MODAL DE PRIVACIDADE E TERMOS LGPD */}
      {showLgpdModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto border-2 border-outline-variant/60 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">verified_user</span>
                </div>
                <div>
                  <h2 className="font-bold text-base text-on-surface leading-tight">
                    Política de Privacidade (LGPD)
                  </h2>
                  <span className="text-[11px] text-outline font-semibold">
                    Lei Geral de Proteção de Dados (nº 13.709/2018)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLgpdModal(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-on-surface-variant leading-relaxed">
              <section className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/40">
                <h3 className="font-bold text-on-surface text-xs flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-primary text-[16px]">security</span>
                  <span>1. Coleta e Finalidade dos Dados</span>
                </h3>
                <p>
                  O NeuroGuia respeita a sua privacidade. Coletamos apenas as informações estritamente necessárias (como nome, e-mail e perfil de estudo) para personalizar seu ambiente de aprendizado, organizar turmas e acompanhar sessões de foco.
                </p>
              </section>

              <section className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/40">
                <h3 className="font-bold text-on-surface text-xs flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-primary text-[16px]">devices</span>
                  <span>2. Modo Autônomo e Armazenamento Local</span>
                </h3>
                <p>
                  No Modo Autônomo, todos os dados de cronômetro e anotações permanecem exclusivamente gravados no seu próprio dispositivo, garantindo total privacidade e funcionamento sem envio para servidores externos.
                </p>
              </section>

              <section className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/40">
                <h3 className="font-bold text-on-surface text-xs flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-primary text-[16px]">gavel</span>
                  <span>3. Seus Direitos como Titular (Art. 18 LGPD)</span>
                </h3>
                <p>
                  Você possui o direito de confirmar a existência do tratamento de dados, acessar suas informações, solicitar correções, a anonimização ou a exclusão completa dos seus dados armazenados na plataforma a qualquer momento.
                </p>
              </section>

              <section className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/40">
                <h3 className="font-bold text-on-surface text-xs flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-primary text-[16px]">child_care</span>
                  <span>4. Proteção de Crianças e Adolescentes</span>
                </h3>
                <p>
                  O tratamento de dados de crianças é realizado visando o melhor interesse do menor, em conformidade com o Art. 14 da LGPD, sob a supervisão de pais, tutores ou educadores responsáveis.
                </p>
              </section>
            </div>

            <div className="pt-2 border-t border-outline-variant/40 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setLgpdAccepted(true);
                  setLgpdError(false);
                  setShowLgpdModal(false);
                }}
                className="w-full bg-primary text-on-primary font-bold text-xs py-3 rounded-2xl shadow-sm hover:bg-primary/90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Entendi e Aceito os Termos LGPD</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

