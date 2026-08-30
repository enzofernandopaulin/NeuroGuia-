import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import { EmotionalJournal } from './EmotionalJournal';

interface AutonomousViewProps {
  setCurrentView: (view: AppView) => void;
  onSwitchToConnectedMode?: () => void;
  onAddCoins?: (amount: number) => void;
}

export const AutonomousView: React.FC<AutonomousViewProps> = ({
  setCurrentView,
  onSwitchToConnectedMode,
  onAddCoins,
}) => {
  const [localNote, setLocalNote] = useState('');
  const [localNotesList, setLocalNotesList] = useState<string[]>([
    'Minha primeira anotação rápida de estudo',
  ]);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [totalTimerSeconds, setTotalTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDescription, setTimerDescription] = useState('Estudo de Matemática');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      const coinsReward = Math.max(10, Math.round((totalTimerSeconds / 60) * 2));
      setEarnedCoins(coinsReward);
      if (onAddCoins) {
        onAddCoins(coinsReward);
      }
      setShowCompletionModal(true);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds, totalTimerSeconds, onAddCoins]);

  const [customMins, setCustomMins] = useState<string>('25');

  const setTimerDuration = (minutes: number) => {
    const validMins = Math.max(1, Math.min(180, minutes));
    const secs = validMins * 60;
    setTotalTimerSeconds(secs);
    setTimerSeconds(secs);
    setCustomMins(validMins.toString());
    setTimerRunning(false);
  };

  const handleApplyCustomMins = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const mins = parseInt(customMins, 10);
    if (!isNaN(mins) && mins > 0) {
      setTimerDuration(mins);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localNote.trim()) return;
    setLocalNotesList([localNote.trim(), ...localNotesList]);
    setLocalNote('');
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-surface text-on-surface flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Header Responsivo */}
      <div className="bg-surface-container-lowest border-2 border-outline-variant/60 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="bg-primary-container text-on-primary-container text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-1.5">
            Modo Autônomo
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">
            Área de Estudo Local
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Utilize o cronômetro e faça suas anotações pessoais.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onSwitchToConnectedMode) onSwitchToConnectedMode();
            setCurrentView('welcome');
          }}
          className="w-full sm:w-auto shrink-0 bg-surface-container hover:bg-surface-container-high border-2 border-outline-variant px-4 py-3 rounded-2xl text-xs font-bold text-primary flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">login</span>
          <span>Entrar com E-mail</span>
        </button>
      </div>

      {/* Grid Responsivo para Cronômetro e Anotações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Cronômetro Personalizável */}
        <div className="bg-surface-container-lowest rounded-3xl p-5 sm:p-6 border-2 border-outline-variant/60 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-[24px]">timer</span>
              <h2 className="font-bold text-base text-on-surface">Cronômetro</h2>
            </div>
            <span className="text-[10px] font-bold text-primary bg-primary-container/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Personalizável
            </span>
          </div>

          {/* Descrição do que está sendo realizado */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">target</span>
              <span>O que você está realizando?</span>
            </label>
            <input
              type="text"
              value={timerDescription}
              onChange={(e) => setTimerDescription(e.target.value)}
              placeholder="Ex: Leitura de História, Redação, Exercícios..."
              className="bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Seletor e edição manual de tempo */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-on-surface-variant">Duração do Timer:</span>
            
            {/* Presets Rápidos */}
            <div className="flex flex-wrap gap-1.5">
              {[5, 15, 25, 45, 60].map((mins) => {
                const isSelected = totalTimerSeconds === mins * 60;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTimerDuration(mins)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/50'
                    }`}
                  >
                    {mins} min
                  </button>
                );
              })}
            </div>

            {/* Edição Manual de Minutos */}
            <form onSubmit={handleApplyCustomMins} className="flex items-center gap-2 mt-1">
              <label htmlFor="custom-mins-input-autonomo" className="text-[11px] font-bold text-outline shrink-0">
                Manual (min):
              </label>
              <input
                id="custom-mins-input-autonomo"
                type="number"
                min="1"
                max="180"
                value={customMins}
                onChange={(e) => setCustomMins(e.target.value)}
                placeholder="Ex: 30"
                className="w-20 bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs font-bold text-on-surface focus:outline-none focus:border-primary transition-all text-center"
              />
              <button
                type="submit"
                className="bg-primary-container text-on-primary-container hover:bg-primary-container/80 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-primary/20"
              >
                Definir
              </button>
            </form>
          </div>

          {/* Exibição do Timer */}
          <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl text-center border border-outline-variant/40 my-1">
            <div className="inline-block bg-surface-container-high px-3 py-1 rounded-full mb-2">
              <p className="text-[11px] font-bold text-primary truncate max-w-[220px]">
                {timerDescription.trim() ? timerDescription : 'Atividade sem nome'}
              </p>
            </div>
            <div>
              <span className="font-mono text-4xl sm:text-5xl font-black text-primary tracking-tight">
                {formatTime(timerSeconds)}
              </span>
            </div>
            <p className="text-xs font-semibold text-on-surface-variant mt-2">
              {timerRunning ? 'Sessão em andamento...' : 'Pronto para iniciar'}
            </p>
          </div>

          {/* Botões de Controle */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setTimerRunning(!timerRunning)}
              className="flex-1 bg-primary text-on-primary font-bold text-sm py-3.5 rounded-2xl border-b-2 border-on-primary-fixed-variant active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">
                {timerRunning ? 'pause' : 'play_arrow'}
              </span>
              <span>{timerRunning ? 'Pausar' : 'Iniciar Cronômetro'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(totalTimerSeconds);
              }}
              className="bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-bold text-xs px-4 py-3.5 rounded-2xl transition-all cursor-pointer"
            >
              Resetar
            </button>
          </div>
        </div>

        {/* Anotações Locais */}
        <div className="bg-surface-container-lowest rounded-3xl p-5 sm:p-6 border-2 border-outline-variant/60 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-tertiary text-[24px]">edit_note</span>
            <h2 className="font-bold text-base text-on-surface">Anotações Locais</h2>
          </div>

          <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={localNote}
              onChange={(e) => setLocalNote(e.target.value)}
              placeholder="Escreva uma anotação..."
              className="flex-1 bg-surface-container-low border-2 border-outline-variant/60 rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-tertiary transition-all"
            />
            <button
              type="submit"
              className="bg-tertiary text-on-tertiary font-bold text-xs px-5 py-3 rounded-2xl border-b-2 border-tertiary-fixed-dim active:translate-y-0.5 transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1 min-h-[44px]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Salvar</span>
            </button>
          </form>

          {/* Lista de Anotações */}
          <div className="flex flex-col gap-2 mt-1 max-h-[220px] overflow-y-auto pr-1">
            {localNotesList.length === 0 ? (
              <p className="text-xs text-outline italic text-center py-4">
                Nenhuma anotação criada.
              </p>
            ) : (
              localNotesList.map((note, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between text-xs font-medium text-on-surface gap-2"
                >
                  <span className="flex-1 break-words">{note}</span>
                  <button
                    type="button"
                    onClick={() => setLocalNotesList(localNotesList.filter((_, i) => i !== idx))}
                    className="text-outline hover:text-error transition-colors p-1 cursor-pointer shrink-0"
                    title="Excluir anotação"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Seção Diário Emocional */}
      <EmotionalJournal onEntryAdded={() => onAddCoins?.(10)} />

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface rounded-3xl p-6 max-w-sm w-full border-2 border-outline-variant shadow-xl text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-3xl animate-bounce">
              🏆
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-on-surface">Sessão Concluída!</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Parabéns por concluir <span className="font-bold text-primary">{timerDescription}</span>!
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl w-full flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-amber-500">
                monetization_on
              </span>
              <span className="font-extrabold text-sm text-amber-800 dark:text-amber-200">
                +{earnedCoins} Moedas Adicionadas!
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCompletionModal(false);
                setTimerSeconds(totalTimerSeconds);
              }}
              className="w-full bg-primary text-on-primary font-bold text-xs py-3 rounded-2xl shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
            >
              Continuar Aprendendo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
