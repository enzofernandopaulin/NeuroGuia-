import React, { useState } from 'react';
import { AppView, UserRole } from '../types';
import { Layers, User, RefreshCw, Smartphone } from 'lucide-react';

interface HeaderProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  onOpenScreenSwitcher: () => void;
  titleOverride?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  role,
  setRole,
  onOpenScreenSwitcher,
  titleOverride,
}) => {
  const logoUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCUpooMIPjPEsJRFz-3De23CyV0iSxEFM37o-GvopeInJYjVjBnArvi-bBxAdifQdn12T39bbEC49RvjM5s5SG8h4vVsEOpszXgcN7IJFCgnTNvapakubDvlDdsaMmo9U9F2cCtrVNWypKM8tZPdFxKnoQBPigpjYU4abs8x86NcWysMwnz7YCyMAIdHLMdISmay5zeKwicTYxqCOUlqW6fphH3VZVxF_cLsZKxAylwG3HJlHP0rZc1eabKJ7ta0DurQA';

  // Determine Title based on current view
  const getHeaderTitle = () => {
    if (titleOverride) return titleOverride;
    switch (currentView) {
      case 'welcome':
        return 'NeuroGuia';
      case 'autonomo-view':
        return 'Modo Autônomo (Offline)';
      case 'foco-home':
        return 'Foco Home';
      case 'estudante-dashboard':
        return 'NeuroGuia';
      case 'join-room':
        return 'NeuroGuia';
      case 'student-room':
        return 'Minha Sala de Foco';
      case 'missoes':
        return 'Missões';
      case 'mascote':
        return 'NeuroGuia';
      case 'sos-overview':
      case 'sos-step1':
      case 'sos-step2':
      case 'sos-step3':
        return 'NeuroGuia';
      case 'tutor-dashboard':
        return 'NeuroGuia';
      default:
        return 'NeuroGuia';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-4 max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand logo & title */}
        <button
          onClick={() => setCurrentView(role === 'tutor' ? 'tutor-dashboard' : 'foco-home')}
          className="flex items-center gap-2 text-left focus:outline-none group"
        >
          <img
            src={logoUrl}
            alt="NeuroGuia Logo"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <span className="font-bold text-xl text-primary tracking-tight">
            {getHeaderTitle()}
          </span>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Demo Screen Switcher Pill */}
          <button
            onClick={onOpenScreenSwitcher}
            className="flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full font-bold text-xs chunky-shadow active:translate-y-0.5 transition-all cursor-pointer hover:brightness-95"
            title="Alternar entre todas as telas da demonstração"
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            <span>Telas</span>
          </button>

          {/* Role Indicator / Profile Badge */}
          <button
            onClick={() => {
              if (currentView === 'welcome') {
                const nextRole = role === 'membro' || role === 'estudante' ? 'anfitriao' : 'membro';
                setRole(nextRole);
              } else {
                setCurrentView('welcome');
              }
            }}
            className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center border-b-2 border-on-primary-fixed-variant shadow-sm active:translate-y-0.5 transition-transform cursor-pointer"
            title={role === 'anfitriao' || role === 'tutor' ? 'Modo Anfitrião' : 'Modo Membro'}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};

