import React from 'react';
import { AppView, UserRole } from '../types';

interface BottomNavProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  role: UserRole;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView, role }) => {
  // If on welcome view or autonomo view, don't display bottom nav
  if (currentView === 'welcome' || currentView === 'autonomo-view') return null;

  const isHome = currentView === 'foco-home' || currentView === 'estudante-dashboard';
  const isMissoes = currentView === 'missoes';
  const isMascote = currentView === 'mascote';
  const isSos = currentView.startsWith('sos');
  const isJoinOrRoom = currentView === 'join-room' || currentView === 'student-room' || currentView === 'tutor-dashboard';

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-xl border-t border-surface-container-high shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto flex justify-between items-center h-20 px-4">
        {/* Início */}
        <button
          onClick={() => setCurrentView('foco-home')}
          className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-xl transition-all ${
            isHome
              ? 'bg-primary-container text-on-primary-container font-bold scale-105 shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Início</span>
        </button>

        {/* Missões */}
        <button
          onClick={() => setCurrentView('missoes')}
          className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-xl transition-all ${
            isMissoes
              ? 'bg-primary-container text-on-primary-container font-bold scale-105 shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">assignment</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Missões</span>
        </button>

        {/* Floating SOS Center Button */}
        <div className="-mt-8 px-1">
          <button
            onClick={() => setCurrentView('sos-overview')}
            className={`w-16 h-16 rounded-full bg-error text-on-error flex flex-col items-center justify-center shadow-[0_4px_0_#93000a] active:translate-y-1 active:shadow-none transition-all ${
              isSos ? 'ring-4 ring-error-container scale-105' : ''
            }`}
            title="Modo SOS - Autorregulação"
          >
            <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              emergency
            </span>
            <span className="text-[9px] font-bold tracking-widest uppercase -mt-1">SOS</span>
          </button>
        </div>

        {/* Mascote */}
        <button
          onClick={() => setCurrentView('mascote')}
          className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-xl transition-all ${
            isMascote
              ? 'bg-primary-container text-on-primary-container font-bold scale-105 shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">pets</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Mascote</span>
        </button>

        {/* Sala de Foco / Painel */}
        <button
          onClick={() => setCurrentView(role === 'anfitriao' || role === 'tutor' ? 'tutor-dashboard' : 'student-room')}
          className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-xl transition-all ${
            isJoinOrRoom
              ? 'bg-primary-container text-on-primary-container font-bold scale-105 shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">
            {role === 'anfitriao' || role === 'tutor' ? 'dashboard' : 'meeting_room'}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            {role === 'anfitriao' || role === 'tutor' ? 'Painel' : 'Sua Sala'}
          </span>
        </button>
      </div>
    </nav>
  );
};
