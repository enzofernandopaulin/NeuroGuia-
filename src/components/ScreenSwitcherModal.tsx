import React from 'react';
import { AppView, UserRole } from '../types';

interface ScreenSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const ScreenSwitcherModal: React.FC<ScreenSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentView,
  setCurrentView,
  role,
  setRole,
}) => {
  if (!isOpen) return null;

  const screens: { id: AppView; label: string; icon: string; group: 'estudante' | 'sos' | 'tutor' | 'auth' }[] = [
    { id: 'welcome', label: '1a. Tela Inicial & Cadastro', icon: 'login', group: 'auth' },
    { id: 'autonomo-view', label: '1b. Modo Autônomo (Cronômetro & Notas)', icon: 'laptop', group: 'auth' },
    { id: 'foco-home', label: '2. Foco Home (Timer Pomodoro)', icon: 'timer', group: 'estudante' },
    { id: 'estudante-dashboard', label: '3. Diário Emocional & Humor', icon: 'sentiment_satisfied', group: 'estudante' },
    { id: 'join-room', label: '4a. Entrar em uma Sala de Foco', icon: 'meeting_room', group: 'estudante' },
    { id: 'student-room', label: '4b. Visão da Sala de Foco', icon: 'groups', group: 'estudante' },
    { id: 'missoes', label: '5. Missões & Conquistas', icon: 'assignment', group: 'estudante' },
    { id: 'mascote', label: '6. Mascote Virtual (Foxie)', icon: 'pets', group: 'estudante' },
    { id: 'sos-overview', label: '7a. SOS Overview (Me Perdi)', icon: 'emergency', group: 'sos' },
    { id: 'sos-step1', label: '7b. SOS 1 (Respire Comigo)', icon: 'air', group: 'sos' },
    { id: 'sos-step2', label: '7c. SOS 2 (Beba Água)', icon: 'water_drop', group: 'sos' },
    { id: 'sos-step3', label: '7d. SOS 3 (Onde você está?)', icon: 'visibility', group: 'sos' },
    { id: 'tutor-dashboard', label: '8. Painel do Anfitrião', icon: 'dashboard', group: 'tutor' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-md border-2 border-outline-variant shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-surface-variant pb-3">
          <div>
            <h3 className="font-bold text-lg text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[22px]">
                layers
              </span>
              Navegação de Demonstração
            </h3>
            <p className="text-xs text-on-surface-variant">
              Explore instantaneamente qualquer tela da plataforma:
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-on-surface hover:bg-surface-container-high cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Role Quick Toggle */}
        <div className="bg-surface-container-high p-2 rounded-2xl flex items-center justify-between">
          <span className="text-xs font-bold text-on-surface-variant px-2">Papel Atual:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRole('membro')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === 'membro' || role === 'estudante'
                  ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                  : 'bg-surface text-on-surface-variant'
              }`}
            >
              👤 Membro
            </button>
            <button
              type="button"
              onClick={() => setRole('anfitriao')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === 'anfitriao' || role === 'tutor'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'bg-surface text-on-surface-variant'
              }`}
            >
              ⭐ Anfitrião
            </button>
          </div>
        </div>

        {/* List of Screens */}
        <div className="flex flex-col gap-2">
          {screens.map((screen) => {
            const isActive = currentView === screen.id;
            return (
              <button
                key={screen.id}
                type="button"
                onClick={() => {
                  if (screen.group === 'tutor') setRole('tutor');
                  if (screen.group === 'estudante') setRole('estudante');
                  setCurrentView(screen.id);
                  onClose();
                }}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary-container/30 border-primary text-on-primary-container font-bold shadow-sm'
                    : 'bg-surface-container-low border-outline-variant/60 text-on-surface hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      screen.group === 'sos'
                        ? 'text-error'
                        : screen.group === 'tutor'
                        ? 'text-primary'
                        : 'text-secondary'
                    }`}
                  >
                    {screen.icon}
                  </span>
                  <span className="text-sm font-medium">{screen.label}</span>
                </div>

                {isActive && (
                  <span className="text-[10px] font-bold bg-primary text-on-primary px-2 py-0.5 rounded-full">
                    Atual
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
