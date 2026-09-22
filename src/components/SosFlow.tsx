import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface SosFlowProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

export const SosFlow: React.FC<SosFlowProps> = ({ currentView, setCurrentView }) => {
  const [breathingText, setBreathingText] = useState('Inspire...');
  const [breathingScale, setBreathingScale] = useState(1);
  const [step3Completed, setStep3Completed] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showTutorChatModal, setShowTutorChatModal] = useState(false);

  // Breathing loop for Step 1
  useEffect(() => {
    if (currentView === 'sos-step1') {
      const interval = setInterval(() => {
        setBreathingScale((prev) => (prev === 1 ? 0.6 : 1));
        setBreathingText((prev) => (prev === 'Inspire...' ? 'Expire...' : 'Inspire...'));
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [currentView]);

  // Handle Confetti for Step 3
  const triggerGroundingDone = () => {
    setStep3Completed(true);
  };

  // --- SUBVIEW 1: SOS OVERVIEW ("Me Perdi") ---
  if (currentView === 'sos-overview') {
    return (
      <div className="pt-20 pb-28 px-4 max-w-xl mx-auto flex flex-col gap-6">
        {/* Header Avatar Illustration */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-24 h-24 rounded-full bg-surface-container-highest mb-3 overflow-hidden shadow-sm flex items-center justify-center p-1 border-2 border-outline-variant/60">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGp93k6c75BssGwO6mVVln-F4sGCAPdhMGKXsE05laUuLw1x0LRsVJlYsKJ7ii877Qs9GKRVCjMYvwZOEbPsYMb_OKiKS-4TKwSOP86fmbW7efZfyNTpVCwOlOfKyCF-jjDVUvN8qG78T96vW3ySeaBYHIc1gFPEaNjIAPZO35awCHHBaY067nmXdpp20lGcUCEpSHF2hVmOsve66Sigu6n71o8jP3JKLbL_sYd-Stnxulps9u3BUQ"
              alt="Mascote Guia"
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-bold text-2xl text-on-surface mb-1">Me Perdi</h1>
          <p className="text-sm text-on-surface-variant max-w-[280px] leading-relaxed">
            Está tudo bem! Acontece. Vamos voltar para o caminho devagar?
          </p>
        </div>

        {/* Quick Help Options */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setCurrentView('sos-step1')}
            className="w-full bg-primary text-on-primary rounded-2xl p-5 flex flex-col items-center justify-center gap-1 border-b-4 border-on-primary-fixed-variant active:border-b-0 active:translate-y-1 transition-all shadow-md cursor-pointer hover:bg-primary/95"
          >
            <span className="material-symbols-outlined text-[32px] mb-0.5">
              center_focus_strong
            </span>
            <span className="font-bold text-base">Quero ajuda para focar</span>
            <span className="text-xs text-on-primary/80 font-medium">Perdi o fio da meada</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('sos-step1')}
            className="w-full bg-surface-container text-on-surface rounded-2xl p-5 flex flex-col items-center justify-center gap-1 border-b-4 border-outline-variant active:border-b-0 active:translate-y-1 transition-all shadow-sm cursor-pointer hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[32px] text-tertiary mb-0.5">
              self_improvement
            </span>
            <span className="font-bold text-base">Estou sobrecarregado</span>
            <span className="text-xs text-on-surface-variant font-medium">
              Preciso respirar um pouco
            </span>
          </button>
        </div>

        {/* Quick Grounding Steps Card */}
        <div className="bg-secondary-container text-on-secondary-container rounded-3xl p-6 border-b-6 border-on-secondary-fixed-variant relative overflow-hidden shadow-sm">
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-on-secondary-fixed text-on-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">directions_walk</span>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Voltar ao eixo</h3>
              <p className="text-xs text-on-secondary-container/90 mb-4 leading-relaxed">
                3 pequenos passos simples para retomar o controle do momento.
              </p>
              <button
                type="button"
                onClick={() => setCurrentView('sos-step1')}
                className="bg-surface text-on-surface rounded-full px-5 py-2.5 font-bold text-sm border-b-4 border-outline-variant flex items-center gap-2 transition-all active:translate-y-0.5 cursor-pointer hover:bg-surface-container-low"
              >
                <span>Começar agora</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Call Emergency Contact */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowEmergencyModal(true)}
            className="w-full flex items-center justify-center gap-2 text-on-surface-variant font-bold text-xs p-3 hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
            <span>Ligar para o contato de emergência</span>
          </button>
        </div>

        {/* Emergency Modal */}
        {showEmergencyModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-sm border-2 border-outline-variant shadow-xl flex flex-col gap-4 text-center">
              <div className="w-14 h-14 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px]">emergency</span>
              </div>
              <h3 className="font-bold text-lg text-on-surface">Contato de Apoio</h3>
              <p className="text-xs text-on-surface-variant">
                Você pode ligar para o anfitrião ou contato de suporte cadastrado:
              </p>
              <div className="p-3 bg-surface-container rounded-2xl text-left border border-outline-variant/60">
                <p className="font-bold text-sm text-on-surface">Anfitrião Principal</p>
                <p className="text-xs text-on-surface-variant font-mono mt-0.5">+55 (11) 98765-4321</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-surface-container text-on-surface font-bold text-xs"
                >
                  Fechar
                </button>
                <a
                  href="tel:+5511987654321"
                  className="flex-1 py-3 rounded-2xl bg-error text-on-error font-bold text-xs flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  Ligar
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- SUBVIEW 2: STEP 1 ("Respire Comigo") ---
  if (currentView === 'sos-step1') {
    return (
      <div className="pt-20 pb-28 px-4 max-w-xl mx-auto flex flex-col items-center justify-between min-h-[80vh]">
        <div className="flex flex-col items-center text-center gap-2 mt-4">
          <h1 className="font-extrabold text-3xl text-primary">Respire Comigo</h1>
          <p className="text-sm text-on-surface-variant max-w-[300px] leading-relaxed">
            Siga o círculo mágico. Inspire quando ele crescer, expire quando ele diminuir.
          </p>
        </div>

        {/* Breathing Circle Area */}
        <div className="relative w-64 h-64 flex items-center justify-center my-8">
          <div
            className="absolute w-full h-full rounded-full bg-primary-container opacity-25 transition-transform duration-[3500ms] ease-in-out"
            style={{ transform: `scale(${breathingScale})` }}
          />
          <div
            className="absolute w-48 h-48 rounded-full bg-primary flex items-center justify-center shadow-lg transition-transform duration-[3500ms] ease-in-out border-4 border-on-primary-fixed-variant"
            style={{ transform: `scale(${breathingScale})` }}
          >
            <span className="font-bold text-2xl text-on-primary transition-opacity duration-700">
              {breathingText}
            </span>
          </div>
        </div>

        {/* Progress & Next Step */}
        <div className="w-full flex flex-col gap-4 max-w-sm">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-bold px-1">
              <span className="text-on-surface-variant">Passo 1 de 3</span>
              <span className="text-primary">Acalmando...</span>
            </div>
            <div className="w-full h-3.5 bg-surface-variant rounded-full overflow-hidden border border-outline-variant">
              <div className="h-full bg-primary rounded-full transition-all duration-500 w-1/3" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('sos-step2')}
            className="w-full bg-surface text-primary font-bold text-base h-14 rounded-2xl flex items-center justify-center gap-2 border-b-4 border-outline-variant active:border-b-2 active:translate-y-0.5 transition-all shadow-sm cursor-pointer hover:bg-surface-container"
          >
            <span>Próximo Passo</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  }

  // --- SUBVIEW 3: STEP 2 ("Beba Água") ---
  if (currentView === 'sos-step2') {
    return (
      <div className="pt-20 pb-28 px-4 max-w-xl mx-auto flex flex-col items-center justify-between min-h-[80vh]">
        {/* SOS Progress Header */}
        <div className="w-full max-w-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentView('sos-step1')}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex items-center gap-1 text-xs font-bold text-error">
              <span className="material-symbols-outlined text-[18px]">emergency</span>
              <span>Modo SOS</span>
            </div>
            <div className="w-10" />
          </div>

          <div className="w-full bg-surface-container-high rounded-full h-3.5 relative overflow-hidden border border-outline-variant">
            <div className="bg-primary h-full rounded-full w-2/3 transition-all duration-700" />
          </div>
          <p className="text-center font-bold text-xs text-on-surface-variant">Passo 2 de 3</p>
        </div>

        {/* Water Illustration */}
        <div className="relative w-60 h-60 flex items-center justify-center my-4">
          <div className="absolute inset-0 bg-secondary-container/20 rounded-full animate-pulse" />
          <div className="w-44 h-44 rounded-[2.5rem] bg-surface overflow-hidden relative shadow-md flex items-center justify-center p-6 border-4 border-secondary-container">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0RssRnwmL1KNI_Cmn94AQAQHsPM9QIt6UZNEE73LQCJx0alhREnTNVqVBw5kiLcAHahh_JPon9ZKdbpx_U7nWGV1Mo_rqV6juPnHLj_v9SB7-4wu7IGrOoTdarP2xYzkr0LkRRoF1atvjv5-Wwj7S0LQMJIJDoSw7apLi-y6_WHmmuE0xQtwAOv9hsKoKj4HiWUP5fM9cu0rhrFFDR-ji5C7VFv8CHbZe6_ojWwjkz9FlHCnKVr2f"
              alt="Copo de Água Simpático"
              className="w-full h-full object-contain filter drop-shadow-md"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Text Instructions */}
        <div className="text-center max-w-sm flex flex-col items-center gap-2">
          <h1 className="font-extrabold text-3xl text-on-surface">Beba Água</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            A hidratação ajuda o cérebro a se acalmar. Tome um pequeno gole de água agora.
          </p>
        </div>

        {/* Button */}
        <div className="w-full max-w-sm mt-4">
          <button
            type="button"
            onClick={() => setCurrentView('sos-step3')}
            className="w-full bg-primary text-on-primary py-4 px-6 rounded-2xl flex items-center justify-center gap-2 border-b-4 border-on-primary-fixed-variant active:border-b-0 active:translate-y-1 transition-all shadow-md font-bold text-base cursor-pointer hover:bg-primary/95"
          >
            <span>Próximo Passo</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  }

  // --- SUBVIEW 4: STEP 3 ("Onde você está?") ---
  return (
    <div className="pt-20 pb-28 px-4 max-w-xl mx-auto flex flex-col items-center justify-between min-h-[80vh]">
      {/* Progress Header */}
      <div className="w-full max-w-sm flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-bold text-on-surface">
          <span>Passo 3 de 3</span>
          <span className="text-tertiary">Quase lá!</span>
        </div>
        <div className="w-full h-3.5 bg-surface-variant rounded-full overflow-hidden">
          <div className="h-full bg-tertiary rounded-full w-full transition-all duration-700" />
        </div>
      </div>

      {/* Mascot Foxie Thumbs Up */}
      <div className="relative w-44 h-44 flex items-center justify-center my-2">
        <div className="absolute inset-0 bg-tertiary-container/20 rounded-full animate-pulse blur-xl" />
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuunTkFi3E4gvoYmvAKVBhMXhCnTigURau7TEyf4-YLpNn4obzWvnDKCT4tE-kVKiNJmXDHfKFC5czTeHhEJctNKABHlWlP9kLgGkP9qkt9qPNgy-_vaNdBOIYU2-NjfJPXZm1fv2dQjen62ZGJCI6vS7CJX269i3dIIBsTtuYm1cS3ulkBHhFsE-LlXHiNNveIOxfe14UH6SC4-a7_r4vRMaqEAsxI8S_zZgpFHfH5lb4Cn51ck7j"
          alt="Foxie Thumbs Up"
          className="w-36 h-36 object-contain relative z-10 animate-float"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Title */}
      <div className="text-center max-w-[280px] flex flex-col gap-1">
        <h1 className="font-extrabold text-2xl text-on-surface">Onde você está?</h1>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Vamos voltar para o agora. Olhe ao seu redor com calma.
        </p>
      </div>

      {/* Interactive Task Card */}
      <button
        type="button"
        onClick={triggerGroundingDone}
        className={`w-full max-w-sm rounded-[2rem] p-5 border-b-4 transition-all flex flex-col items-center gap-2 relative overflow-hidden cursor-pointer ${
          step3Completed
            ? 'bg-tertiary text-on-tertiary border-tertiary-fixed-dim'
            : 'bg-surface-container text-on-surface border-outline-variant hover:bg-surface-container-high'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm ${
            step3Completed ? 'bg-surface text-tertiary' : 'bg-tertiary-container text-on-tertiary-container'
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">
            {step3Completed ? 'check_circle' : 'visibility'}
          </span>
        </div>

        <h2 className="font-bold text-base text-center">
          Encontre <span className={step3Completed ? 'underline' : 'text-tertiary font-extrabold'}>3 coisas verdes</span> no ambiente
        </h2>

        <p className="text-xs opacity-80">
          {step3Completed ? '✨ Exercício concluído!' : '(Toque aqui quando encontrar)'}
        </p>
      </button>

      {/* Action Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-2 mt-4">
        <button
          type="button"
          onClick={() => setCurrentView('estudante-dashboard')}
          className={`w-full bg-primary text-on-primary rounded-[2rem] h-16 flex items-center justify-center gap-2 border-b-4 border-on-primary-fixed-variant active:border-b-0 active:translate-y-1 transition-all shadow-md font-bold text-lg cursor-pointer ${
            !step3Completed ? 'opacity-50' : 'hover:bg-primary/95'
          }`}
        >
          <span>Estou Pronto para Voltar!</span>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            favorite
          </span>
        </button>

        <button
          type="button"
          onClick={() => setShowTutorChatModal(true)}
          className="w-full bg-surface-container-low text-secondary rounded-[2rem] h-12 flex items-center justify-center gap-2 border-b-2 border-outline-variant font-bold text-sm hover:bg-surface-container cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">chat</span>
          <span>Falar com o Anfitrião</span>
        </button>
      </div>

      {/* Tutor / Host Chat Modal */}
      {showTutorChatModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-sm border-2 border-outline-variant shadow-xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-on-surface">Mensagem para o Anfitrião</h3>
              <button
                type="button"
                onClick={() => setShowTutorChatModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-on-surface-variant">
              Envie um sinal silencioso ou mensagem para o anfitrião do espaço:
            </p>
            <textarea
              rows={3}
              placeholder="Preciso de um momento de pausa ou apoio..."
              className="w-full p-3 bg-surface-container rounded-2xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => {
                alert('Mensagem enviada com sucesso ao anfitrião!');
                setShowTutorChatModal(false);
              }}
              className="w-full py-3 bg-primary text-on-primary font-bold text-sm rounded-2xl border-b-4 border-on-primary-fixed-variant cursor-pointer"
            >
              Enviar Mensagem
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

