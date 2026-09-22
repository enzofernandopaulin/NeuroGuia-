import React, { useState, useEffect } from 'react';
import { RoutineTask } from '../types';

interface FocoHomeProps {
  tasks: RoutineTask[];
  onToggleTask: (id: string) => void;
  onOpenNewTaskModal: () => void;
  onAddCoins?: (amount: number) => void;
}

export const FocoHome: React.FC<FocoHomeProps> = ({
  tasks,
  onToggleTask,
  onOpenNewTaskModal,
  onAddCoins,
}) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTaskTitle, setActiveTaskTitle] = useState<string>('Sessão de Foco');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);

  const [customMins, setCustomMins] = useState<string>('25');

  const setTimerMinutes = (minutes: number) => {
    const validMins = Math.max(1, Math.min(180, minutes));
    const secs = validMins * 60;
    setTotalTime(secs);
    setTimeLeft(secs);
    setCustomMins(validMins.toString());
    setIsRunning(false);
  };

  const handleApplyCustomMins = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const mins = parseInt(customMins, 10);
    if (!isNaN(mins) && mins > 0) {
      setTimerMinutes(mins);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      const coinsReward = Math.max(10, Math.round((totalTime / 60) * 2)); // 2 coins per minute
      setEarnedCoins(coinsReward);
      if (onAddCoins) {
        onAddCoins(coinsReward);
      }
      setShowCompletionModal(true);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, totalTime, onAddCoins]);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Ring offset calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference;

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const totalTasksCount = tasks.length;
  const progressPercent =
    totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;

  return (
    <div className="pt-20 pb-28 px-4 max-w-xl mx-auto flex flex-col gap-6">
      {/* Header Banner Card */}
      <div className="relative bg-surface-container p-6 rounded-3xl overflow-hidden border border-outline-variant/50 shadow-sm">
        <div className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV0E2AAJosX7Mbn0f_llRfom4hFHaP3bA8Ty6VjxPxrJ1TxaRjhjXXXgbGRuGf5Ko-g5XnViH_Iu1YxRrVUj_S-G0fixANTGg5ufNlQt2ckc3S7mU8vW9yMEXPqNFyAGHNnke0tE-M3NmuYcoV8rU9Ec9Y_zpQayeb-CUB3V449Gv-UzWNq3u6Eu-41xFzsIP-Qidq_DB3MeodbCwnmT_5-_-Jcse3nWSyZ2tK3tsAxSI2cF-8eqSzg_JuCVMWskBq3Q"
            alt="Watermark Mascot"
            className="w-36 h-36 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 flex flex-col gap-2">
          <h2 className="font-bold text-2xl text-on-surface">Pronto para focar?</h2>
          <p className="text-sm text-on-surface-variant font-medium">
            Organize seu tempo e evite distrações.
          </p>

          <button
            onClick={onOpenNewTaskModal}
            className="mt-3 w-full bg-primary text-on-primary font-bold text-base py-3.5 px-5 rounded-full flex items-center justify-center gap-2 border-b-4 border-on-primary-fixed-variant active:border-b-0 active:translate-y-1 transition-all shadow-md cursor-pointer hover:bg-primary/95"
          >
            <span className="material-symbols-outlined text-[22px]">add_circle</span>
            <span>Nova Atividade</span>
          </button>
        </div>
      </div>

      {/* Pomodoro Timer Card */}
      <div className="bg-surface-container-low p-6 sm:p-7 rounded-[3rem] border-2 border-outline-variant/60 flex flex-col items-center justify-center shadow-sm relative gap-4">
        {/* Customization Inputs */}
        <div className="w-full flex flex-col gap-3 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/40">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">target</span>
              <span>O que está sendo realizado no cronômetro?</span>
            </label>
            <input
              type="text"
              value={activeTaskTitle}
              onChange={(e) => setActiveTaskTitle(e.target.value)}
              placeholder="Digite o objetivo (ex: Estudo de Biologia, Leitura...)"
              className="bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-on-surface-variant">Alterar Tempo do Cronômetro:</span>
            
            {/* Presets Rápidos */}
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {[5, 15, 25, 45, 60].map((mins) => {
                const isSelected = totalTime === mins * 60;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTimerMinutes(mins)}
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

            {/* Edição Manual */}
            <form onSubmit={handleApplyCustomMins} className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
              <label htmlFor="custom-mins-input-foco" className="text-[11px] font-bold text-outline shrink-0">
                Manual (min):
              </label>
              <input
                id="custom-mins-input-foco"
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
        </div>

        {/* Mode Badge */}
        <div className="mt-1">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary-container/40 px-4 py-1.5 rounded-full border border-primary/20 max-w-[280px] truncate inline-block">
            {activeTaskTitle.trim() ? activeTaskTitle : 'Modo Foco'}
          </span>
        </div>

        {/* Big Timer Circle Display */}
        <div className="relative flex items-center justify-center w-60 h-60 sm:w-64 sm:h-64 my-2">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-surface-container-highest"
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
            />
            <circle
              className="text-primary transition-all duration-1000 ease-linear"
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          <div className="flex flex-col items-center z-10 px-4 text-center">
            <span className="font-extrabold text-4xl sm:text-5xl text-on-surface tracking-tight font-mono">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs font-bold text-on-surface-variant mt-2 tracking-widest uppercase">
              Minutos
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex gap-4">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-on-primary border-b-4 shadow-md active:border-b-0 active:translate-y-1 transition-all cursor-pointer ${
              isRunning
                ? 'bg-error border-on-error-container'
                : 'bg-primary border-on-primary-fixed-variant'
            }`}
            title={isRunning ? 'Pausar' : 'Iniciar'}
          >
            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isRunning ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button
            onClick={resetTimer}
            className="w-16 h-16 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center border-b-4 border-outline-variant active:border-b-0 active:translate-y-1 transition-all shadow-sm hover:bg-surface-container-high cursor-pointer"
            title="Reiniciar"
          >
            <span className="material-symbols-outlined text-[28px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Routine / Tasks & Productivity Section */}
      <div className="flex flex-col gap-4">
        {/* Productivity Header & Progress Meter */}
        <div className="bg-surface-container-lowest border-2 border-outline-variant/60 rounded-3xl p-5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-secondary-container/80 text-secondary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">trending_up</span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-on-surface">Painel de Produtividade</h3>
                <p className="text-xs text-outline font-medium">
                  {completedTasks.length} de {tasks.length} atividades concluídas ({progressPercent}%)
                </p>
              </div>
            </div>

            <span className="text-xs font-black bg-primary-container/60 text-primary px-3 py-1 rounded-full border border-primary/20">
              {progressPercent === 100
                ? '🏆 100% Produtivo'
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

          <p className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-amber-500">auto_awesome</span>
            <span>
              {progressPercent === 100
                ? 'Incrível! Todas as metas concluídas. Você mandou muito bem hoje!'
                : progressPercent >= 50
                ? 'Mais da metade realizada! Mantenha o foco para completar o restante.'
                : 'Marque suas atividades conforme for realizando para enviá-las ao histórico de produtividade.'}
            </span>
          </p>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-lg text-on-surface">Minhas Atividades</h3>
          <button
            type="button"
            onClick={onOpenNewTaskModal}
            className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Nova Atividade</span>
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-surface-bright border-2 border-surface-variant border-dashed p-8 rounded-3xl flex flex-col items-center text-center opacity-90">
            <div className="w-16 h-16 bg-secondary-fixed rounded-2xl flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[32px] text-on-secondary-fixed">
                checklist
              </span>
            </div>
            <h4 className="font-bold text-lg text-on-surface mb-1">Sem tarefas ainda</h4>
            <p className="text-sm text-on-surface-variant max-w-[260px]">
              Adicione uma atividade acima para começar a monitorar seu progresso.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* 1. ATIVIDADES PENDENTES (Para Realizar) */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-outline uppercase tracking-wider px-1">
                <span className="material-symbols-outlined text-[16px]">pending_actions</span>
                <span>Para Realizar ({pendingTasks.length})</span>
              </div>

              {pendingTasks.length === 0 ? (
                <div className="p-4 bg-primary-container/20 border border-primary/30 rounded-2xl text-center text-xs font-bold text-primary flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                  <span>Todas as atividades pendentes foram concluídas! Parabéns!</span>
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      onToggleTask(task.id);
                      if (onAddCoins) onAddCoins(15);
                    }}
                    className="p-4 rounded-2xl border-2 bg-surface-container-lowest border-outline-variant hover:border-primary shadow-xs flex items-center justify-between gap-3 cursor-pointer transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-outline-variant bg-surface hover:border-primary flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-[16px] text-transparent hover:text-primary">
                          check
                        </span>
                      </div>
                      <div>
                        <h5 className="font-bold text-base text-on-surface">
                          {task.title}
                        </h5>
                        <p className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5 flex-wrap">
                          <span>⏰ {task.time}</span>
                          {task.estimatedTime && <span>• ⏱️ {task.estimatedTime}</span>}
                          {task.category && (
                            <span className="bg-primary-container/40 text-primary px-2 py-0.5 rounded-md font-bold text-[10px]">
                              {task.category}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTaskTitle(task.title);
                        setTimeLeft(15 * 60);
                        setTotalTime(15 * 60);
                        setIsRunning(true);
                      }}
                      className="bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 hover:brightness-95 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                      <span>Focar</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* 2. ATIVIDADES CONCLUÍDAS / REALIZADAS (VÃO PARA BAIXO - PRODUTIVIDADE) */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-outline-variant/40">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-xs font-extrabold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px] text-teal-600">task_alt</span>
                  <span>Concluídas & Produtividade ({completedTasks.length})</span>
                </div>
                {completedTasks.length > 0 && (
                  <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                    ✨ +{completedTasks.length * 15} Moedas Ganhas
                  </span>
                )}
              </div>

              {completedTasks.length === 0 ? (
                <div className="p-4 bg-surface-container/40 border border-dashed border-outline-variant/60 rounded-2xl text-center text-xs font-medium text-outline">
                  Conclua suas atividades acima e elas virão para cá automaticamente!
                </div>
              ) : (
                completedTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onToggleTask(task.id)}
                    className="p-4 rounded-2xl border-2 bg-teal-500/10 border-teal-500/30 flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-teal-500/15"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shadow-2xs">
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-base text-on-surface line-through decoration-teal-600/70 opacity-80">
                          {task.title}
                        </h5>
                        <p className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5 flex-wrap">
                          <span>⏰ {task.time}</span>
                          {task.estimatedTime && <span>• ⏱️ {task.estimatedTime}</span>}
                          {task.category && (
                            <span className="bg-teal-600/20 text-teal-800 dark:text-teal-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                              {task.category}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-black bg-teal-600 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      <span>Realizada</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

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
                Parabéns por concluir <span className="font-bold text-primary">{activeTaskTitle}</span>!
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
                resetTimer();
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

