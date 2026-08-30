import React, { useState, useEffect } from 'react';
import { AppView, MoodType, RoutineTask } from '../types';
import { EmotionalJournal } from './EmotionalJournal';

interface StudentDashboardProps {
  tasks: RoutineTask[];
  onToggleTask: (id: string) => void;
  setCurrentView: (view: AppView) => void;
  userName?: string;
  onAddCoins?: (amount: number) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  tasks,
  onToggleTask,
  setCurrentView,
  userName = 'Estudante',
  onAddCoins,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(15 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const moodList: { id: MoodType; emoji: string; label: string; message: string }[] = [
    {
      id: 'happy',
      emoji: '😊',
      label: 'Feliz',
      message: `Que bom que você está se sentindo bem, ${userName}! Vamos usar essa energia positiva hoje! 🚀`,
    },
    {
      id: 'calm',
      emoji: '😌',
      label: 'Calmo',
      message: `Isso aí! Um dia tranquilo é ótimo para aprender no seu ritmo. Estou aqui com você! 🍃`,
    },
    {
      id: 'focused',
      emoji: '🎯',
      label: 'Focado',
      message: `Sensacional! Seu foco vai te ajudar a alcançar resultados incríveis hoje! ⚡`,
    },
    {
      id: 'curious',
      emoji: '🧐',
      label: 'Curioso',
      message: `A curiosidade é o superpoder da descoberta! O que vamos aprender de novo hoje? 🔎`,
    },
    {
      id: 'excited',
      emoji: '🤩',
      label: 'Empolgado',
      message: `Uau! Toda essa empolgação vai transformar seu aprendizado numa grande aventura! 🎉`,
    },
    {
      id: 'creative',
      emoji: '🎨',
      label: 'Criativo',
      message: `Incrível! Deixe suas ideias brilharem e crie coisas maravilhosas hoje! ✨`,
    },
    {
      id: 'anxious',
      emoji: '😟',
      label: 'Ansioso',
      message: `Está tudo bem sentir ansiedade. Respire fundo, estamos juntos nisso e sem pressa! 🫂`,
    },
    {
      id: 'tired',
      emoji: '🥱',
      label: 'Cansado',
      message: `Tudo bem estar cansado. Vamos fazer as coisas devagar e com pausas relaxantes! 🛋️`,
    },
    {
      id: 'overwhelmed',
      emoji: '🤯',
      label: 'Agitado',
      message: `Eu entendo. Parece muita coisa, né? Respire fundo. Vamos um passo de cada vez! 💙`,
    },
    {
      id: 'sad',
      emoji: '😢',
      label: 'Triste',
      message: `Sinto muito que você esteja assim. Lembre-se que você é muito especial e seu tempo é valioso! 🌸`,
    },
    {
      id: 'frustrated',
      emoji: '😤',
      label: 'Frustrado',
      message: `Desafios fazem parte da jornada. Respire, faça uma pausa e tente novamente com calma! 💡`,
    },
  ];

  const currentMoodObj = moodList.find((m) => m.id === selectedMood);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pt-20 pb-28 px-4 max-w-xl mx-auto flex flex-col gap-6">
      {/* Greeting & Mood Tracker */}
      <section className="flex flex-col gap-3">
        <h1 className="font-bold text-xl sm:text-2xl text-on-surface">
          Olá, {userName}! Como você está se sentindo?
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {moodList.map((m) => {
            const isSelected = selectedMood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMood(m.id)}
                className={`p-3.5 rounded-[1.8rem] border-b-4 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary-container text-on-primary-container border-primary scale-102 shadow-md'
                    : 'bg-surface-container-highest text-on-surface border-outline-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="text-[38px] leading-none mb-1.5">{m.emoji}</span>
                <span className="font-black text-sm">{m.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Foxie Mascot Support Banner (shows when mood chosen) */}
      {currentMoodObj && (
        <section className="animate-float">
          <div className="bg-primary text-on-primary p-4 rounded-[2rem] flex items-center gap-4 relative overflow-hidden shadow-md">
            <div className="w-16 h-16 shrink-0 rounded-full bg-surface overflow-hidden border-2 border-primary-fixed shadow-inner flex items-center justify-center">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtRvgEuquW7NnSgUdPPTCvIeggpq02gq5EVFuNOkSVfKJogTG89bHNuECEtsoM3eTnmkwnTk-mpQULI_466XXwnyF7gzdIuI-dURd1lSTpkIIWnNLi5iaBLuvKhv3NVPotPzYPKgG4al8SvG6uNeV3XjIDNDtJz3qVFYOTxSXeyIA9E0jws7BmLjoES3DwBm2W-EKgeTjB97EyF31CwcBRUSS1SvW8L7KIfeyFUP5Dm8irOwlQFbh6"
                alt="Foxie Mascot"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 z-10">
              <p className="text-sm font-bold leading-snug">
                {currentMoodObj.message}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Seção Diário Emocional */}
      <EmotionalJournal onEntryAdded={() => onAddCoins?.(10)} />

      {/* "Sua Sala de Foco" Banner */}
      <section className="flex flex-col gap-3">
        <div className="bg-primary-container text-on-primary-container p-5 rounded-[2rem] border-b-4 border-primary/40 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">meeting_room</span>
            </div>
            <div>
              <h3 className="font-bold text-base">Sua Sala de Foco</h3>
              <p className="text-xs text-on-primary-container/80">
                Acesse o mural de avisos, recursos e orientações do anfitrião.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('student-room')}
            className="bg-primary text-on-primary px-4 py-2.5 rounded-2xl font-bold text-xs border-b-2 border-on-primary-fixed-variant active:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Entrar</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* "Agora" Section - Active Activity */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-xl text-on-surface">Agora</h2>
        <div className="bg-secondary-container text-on-secondary-container p-6 rounded-[2rem] flex flex-col items-center relative overflow-hidden border-b-4 border-secondary-fixed shadow-sm">
          <h3 className="font-bold text-xl z-10 text-center mb-1">Leitura de Ciências</h3>

          {/* Circle Timer */}
          <div className="relative w-44 h-44 my-4 z-10 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                className="stroke-white/30"
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="10"
              />
              <circle
                className="stroke-primary transition-all duration-1000"
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * (1 - timerSeconds / (15 * 60))}
                strokeLinecap="round"
              />
            </svg>
            <div className="flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-extrabold text-primary">
                {formatTimer(timerSeconds)}
              </span>
              <span className="text-[10px] font-bold text-on-secondary-container uppercase tracking-widest mt-1">
                Minutos
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTimerRunning(!timerRunning)}
            className="z-10 bg-primary text-on-primary px-8 py-3 rounded-full font-bold text-base border-b-4 border-on-primary-fixed-variant active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {timerRunning ? 'pause' : 'play_arrow'}
            </span>
            <span>{timerRunning ? 'Pausar' : 'Começar'}</span>
          </button>
        </div>
      </section>

      {/* Routine & Productivity Section */}
      <section className="flex flex-col gap-4">
        {/* Productivity Header & Progress Meter */}
        {(() => {
          const pendingTasks = tasks.filter((t) => !t.completed);
          const completedTasks = tasks.filter((t) => t.completed);
          const totalCount = tasks.length;
          const completedCount = completedTasks.length;
          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <>
              <div className="bg-surface-container-lowest border-2 border-outline-variant/60 rounded-3xl p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-secondary-container/80 text-secondary flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[20px]">trending_up</span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-on-surface">Progresso da Rotina</h3>
                      <p className="text-xs text-outline font-medium">
                        {completedCount} de {totalCount} concluídas ({progressPercent}% Produtivo)
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black bg-primary-container/60 text-primary px-3 py-1 rounded-full border border-primary/20">
                    {progressPercent === 100
                      ? '🏆 Concluído'
                      : progressPercent >= 50
                      ? '⚡ Em Alta'
                      : '🎯 Em Progresso'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden p-0.5 border border-outline-variant/40">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-secondary to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <h2 className="font-bold text-xl text-on-surface">Sua Rotina</h2>

              <div className="flex flex-col gap-6">
                {/* 1. ATIVIDADES PENDENTES */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-outline uppercase tracking-wider px-1">
                    <span className="material-symbols-outlined text-[16px]">pending_actions</span>
                    <span>Para Realizar ({pendingTasks.length})</span>
                  </div>

                  {pendingTasks.length === 0 ? (
                    <div className="p-4 bg-primary-container/20 border border-primary/30 rounded-2xl text-center text-xs font-bold text-primary flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                      <span>Todas as tarefas pendentes foram realizadas! Excelente trabalho!</span>
                    </div>
                  ) : (
                    pendingTasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => {
                          onToggleTask(task.id);
                          if (onAddCoins) onAddCoins(15);
                        }}
                        className="w-full p-4 rounded-2xl flex items-center gap-3 border-2 border-outline-variant bg-surface-container hover:bg-surface-container-high transition-all text-left cursor-pointer shadow-xs hover:-translate-y-0.5"
                      >
                        <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-bold bg-secondary-container text-on-secondary-container">
                          <span className="material-symbols-outlined text-[24px]">
                            task_alt
                          </span>
                        </div>

                        <div className="flex-1">
                          <p className="font-bold text-base leading-tight text-on-surface">
                            {task.title}
                          </p>
                          <p className="text-xs text-outline font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>⏰ {task.time}</span>
                            {task.estimatedTime && <span>• ⏱️ {task.estimatedTime}</span>}
                            {task.category && (
                              <span className="bg-primary-container/40 text-primary px-2 py-0.5 rounded-md font-bold text-[10px]">
                                {task.category}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="w-9 h-9 shrink-0 rounded-full border-2 border-outline-variant bg-surface hover:border-primary flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-[18px] text-transparent hover:text-primary">
                            check
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* 2. ATIVIDADES CONCLUÍDAS (VÃO PARA BAIXO - PRODUTIVIDADE) */}
                <div className="flex flex-col gap-2.5 pt-2 border-t border-outline-variant/40">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[18px] text-teal-600">task_alt</span>
                      <span>Realizadas ({completedTasks.length})</span>
                    </div>
                    {completedTasks.length > 0 && (
                      <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                        ✨ +{completedTasks.length * 15} Moedas
                      </span>
                    )}
                  </div>

                  {completedTasks.length === 0 ? (
                    <div className="p-4 bg-surface-container/40 border border-dashed border-outline-variant/60 rounded-2xl text-center text-xs font-medium text-outline">
                      Realize tarefas para arquivá-las aqui no seu histórico de produtividade.
                    </div>
                  ) : (
                    completedTasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => onToggleTask(task.id)}
                        className="w-full p-4 rounded-2xl flex items-center gap-3 border-2 border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/15 transition-all text-left cursor-pointer"
                      >
                        <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-bold bg-teal-600 text-white shadow-2xs">
                          <span className="material-symbols-outlined text-[24px]">
                            check_circle
                          </span>
                        </div>

                        <div className="flex-1">
                          <p className="font-bold text-base leading-tight text-on-surface line-through decoration-teal-600/70 opacity-80">
                            {task.title}
                          </p>
                          <p className="text-xs text-outline font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>⏰ {task.time}</span>
                            {task.estimatedTime && <span>• ⏱️ {task.estimatedTime}</span>}
                            {task.category && (
                              <span className="bg-teal-600/20 text-teal-800 dark:text-teal-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                {task.category}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="w-9 h-9 shrink-0 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-2xs">
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          );
        })()}
      </section>

      {/* SOS Button */}
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setCurrentView('sos-overview')}
          className="w-full bg-error text-on-error py-5 rounded-[2rem] flex flex-col items-center justify-center gap-2 border-b-8 border-on-error-container active:border-b-2 active:translate-y-1.5 transition-all shadow-lg cursor-pointer hover:bg-error/95"
        >
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              emergency
            </span>
          </div>
          <span className="font-bold text-xl uppercase tracking-wider">Preciso de Ajuda</span>
        </button>
      </div>
    </div>
  );
};
