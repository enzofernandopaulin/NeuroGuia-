import React, { useState } from 'react';
import { RoutineTask, TeaProfile, UserRole } from '../types';

interface Props {
  profile: TeaProfile;
  tasks: RoutineTask[];
  nextTask?: RoutineTask;
  onToggleTask: (id: string) => void;
  onBackToResponsible: () => void;
  role: UserRole;
}

export const TeaHome: React.FC<Props> = ({
  profile,
  tasks,
  nextTask,
  onToggleTask,
  onBackToResponsible,
  role,
}) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<RoutineTask | undefined>(nextTask);
  const [stepIndex, setStepIndex] = useState(0);

  const startTask = (task: RoutineTask) => {
    setActiveTask(task);
    setStepIndex(0);
    setHelpOpen(false);
  };

  const completeActive = () => {
    if (activeTask) onToggleTask(activeTask.id);
    setActiveTask(undefined);
    setStepIndex(0);
  };

  const remaining = tasks.filter((task) => !task.completed);

  return (
    <main className={`min-h-screen px-5 py-7 max-w-3xl mx-auto ${profile.softVisualMode ? 'tracking-normal' : ''}`}>
      <header className="flex items-center justify-between mb-7">
        <div>
          <p className="text-sm opacity-70">Olá,</p>
          <h1 className="text-3xl font-extrabold">{profile.name}</h1>
        </div>
        {role === 'responsavel' && (
          <button onClick={onBackToResponsible} className="rounded-2xl border-2 border-outline-variant px-4 py-2.5 font-bold text-sm">
            Área do responsável
          </button>
        )}
      </header>

      {profile.routineChangeWarning && (
        <div className="rounded-2xl border border-outline-variant bg-white/80 p-4 mb-5 flex gap-3 items-start">
          <span className="material-symbols-outlined">event_note</span>
          <div>
            <strong>Hoje está tudo como planejado.</strong>
            <p className="text-sm opacity-70 mt-1">Se algo mudar, o NeuroGuia vai avisar aqui.</p>
          </div>
        </div>
      )}

      {!activeTask && nextTask && (
        <section className="rounded-3xl bg-white border border-outline-variant/60 p-6 shadow-sm mb-5">
          <p className="text-xs font-extrabold uppercase tracking-wider opacity-60">Agora</p>
          <div className="my-5 w-20 h-20 rounded-3xl bg-primary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary">task_alt</span>
          </div>
          <h2 className="text-3xl font-extrabold">{nextTask.title}</h2>
          <p className="mt-2 text-sm opacity-70">{nextTask.time}</p>
          <button onClick={() => startTask(nextTask)} className="w-full mt-6 rounded-2xl bg-primary text-white py-4 text-lg font-extrabold">
            Começar
          </button>
        </section>
      )}

      {activeTask && (
        <section className="rounded-3xl bg-white border border-outline-variant/60 p-6 shadow-sm mb-5">
          <p className="text-xs font-extrabold uppercase tracking-wider opacity-60">Fazendo agora</p>
          <h2 className="text-2xl font-extrabold mt-2">{activeTask.title}</h2>

          {profile.stepByStep && activeTask.steps?.length ? (
            <div className="mt-6">
              <div className="text-sm font-bold opacity-60 mb-2">Etapa {Math.min(stepIndex + 1, activeTask.steps.length)} de {activeTask.steps.length}</div>
              <div className="rounded-2xl bg-surface-container-low p-6 text-xl font-extrabold">
                {activeTask.steps[stepIndex]}
              </div>
              {stepIndex < activeTask.steps.length - 1 ? (
                <button onClick={() => setStepIndex(stepIndex + 1)} className="w-full mt-4 rounded-2xl bg-primary text-white py-4 font-extrabold">Consegui, próxima etapa</button>
              ) : (
                <button onClick={completeActive} className="w-full mt-4 rounded-2xl bg-tertiary text-white py-4 font-extrabold">Terminei ✓</button>
              )}
            </div>
          ) : (
            <button onClick={completeActive} className="w-full mt-6 rounded-2xl bg-tertiary text-white py-4 font-extrabold">Concluir tarefa ✓</button>
          )}
        </section>
      )}

      {remaining.length > 1 && (
        <section className="rounded-3xl bg-white border border-outline-variant/60 p-5 mb-5">
          <h2 className="font-extrabold text-lg mb-3">Depois</h2>
          <div className="space-y-2">
            {remaining.filter((task) => task.id !== activeTask?.id && task.id !== nextTask?.id).map((task) => (
              <button key={task.id} onClick={() => startTask(task)} className="w-full rounded-2xl bg-surface-container-low p-4 text-left">
                <div className="font-bold">{task.title}</div>
                <div className="text-xs opacity-60 mt-1">{task.time}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {profile.helpButton && (
        <button onClick={() => setHelpOpen(true)} className="w-full rounded-3xl border-2 border-secondary bg-secondary-fixed py-4 text-secondary font-extrabold text-lg flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">help</span>
          Me perdi
        </button>
      )}

      {helpOpen && (
        <div className="fixed inset-0 bg-black/35 p-5 flex items-end sm:items-center justify-center">
          <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-secondary-fixed flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-secondary">explore</span>
            </div>
            <h2 className="text-2xl font-extrabold">Vamos continuar juntos.</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Agora você precisa fazer:</p>
            <div className="rounded-2xl bg-surface-container-low p-4 my-4 text-lg font-extrabold">
              {activeTask?.title || nextTask?.title || 'Sua próxima tarefa'}
            </div>
            <div className="grid gap-2">
              {(activeTask || nextTask)?.steps?.length ? (
                <button onClick={() => { startTask(activeTask || nextTask!); setHelpOpen(false); }} className="rounded-2xl bg-primary text-white py-3.5 font-extrabold">Mostrar passo a passo</button>
              ) : null}
              <button onClick={() => setHelpOpen(false)} className="rounded-2xl border-2 border-outline-variant py-3.5 font-extrabold">Entendi</button>
              <button onClick={() => setHelpOpen(false)} className="rounded-2xl border-2 border-secondary text-secondary py-3.5 font-extrabold">Pedir ajuda ao responsável</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
