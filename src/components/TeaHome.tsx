import React, { useEffect, useMemo, useState } from 'react';
import { GameProgress, RoutineChangeNotice, RoutineTask, SupportRequestKind, TeaProfile, UserRole } from '../types';
import { getSupportPreset } from '../lib/supportPresets';

interface Props {
  profile: TeaProfile;
  tasks: RoutineTask[];
  nextTask?: RoutineTask;
  onToggleTask: (id: string) => Promise<boolean>;
  onBackToResponsible: () => void;
  role: UserRole;
  routineChanges: RoutineChangeNotice[];
  onSupportRequest: (kind: SupportRequestKind, task?: RoutineTask) => Promise<void>;
  onAcknowledgeChange: (id: string) => Promise<void>;
  onLeaveRoom: () => Promise<void> | void;
  gameProgress: GameProgress | null;
}

export const TeaHome: React.FC<Props> = ({
  profile, tasks, nextTask, onToggleTask, onBackToResponsible, role,
  routineChanges, onSupportRequest, onAcknowledgeChange, onLeaveRoom, gameProgress,
}) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const [activeTask, setActiveTask] = useState<RoutineTask | undefined>(nextTask);
  const [stepIndex, setStepIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const supportPreset = getSupportPreset(profile.supportLevel);

  const soundSensitive = profile.sensoryTriggers.includes('sons');
  const visualSensitive = profile.softVisualMode;
  const reduceMotion = profile.sensoryTriggers.includes('animacoes');
  const imageMode = profile.communicationPreference === 'imagem' || profile.communicationPreference === 'texto-imagem';
  const audioMode = profile.communicationPreference === 'audio' && !soundSensitive;
  const isResponsiblePreview = role === 'responsavel';

  const currentHelpTask = activeTask || nextTask;

  useEffect(() => {
    if (audioMode) setAudioEnabled(true);
    if (soundSensitive) setAudioEnabled(false);
  }, [audioMode, soundSensitive]);

  const speak = (text: string) => {
    if (!audioEnabled || soundSensitive || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const startTask = (task: RoutineTask) => {
    setActiveTask(task);
    setStepIndex(0);
    setHelpOpen(false);
    setHelpMessage('');
    speak(task.steps?.[0] || task.title);
  };

  const completeActive = async () => {
    if (!activeTask || pendingAction) return;
    if (isResponsiblePreview) {
      setActiveTask(undefined);
      setStepIndex(0);
      setHelpMessage('Demonstração concluída. O progresso do estudante não foi alterado.');
      return;
    }
    setPendingAction('concluir');
    const completed = await onToggleTask(activeTask.id);
    setPendingAction(null);
    if (!completed) {
      setHelpMessage('Não foi possível concluir agora. Tente novamente.');
      return;
    }
    setActiveTask(undefined);
    setStepIndex(0);
    setHelpMessage('Tarefa concluída. Muito bem!');
  };

  const registerSupport = async (kind: SupportRequestKind, message: string, closeModal = true) => {
    if (pendingAction) return;
    setPendingAction(kind);
    try {
      await onSupportRequest(kind, currentHelpTask);
      if (closeModal) setHelpOpen(false);
      setHelpMessage(message);
    } catch {
      setHelpMessage('Não foi possível enviar agora. Mostre esta tela ao responsável.');
    } finally {
      setPendingAction(null);
    }
  };

  const openHelp = async () => {
    setHelpMessage('');
    setHelpOpen(true);
    await registerSupport('me-perdi', 'O responsável foi avisado que você se perdeu.', false);
  };

  const remaining = tasks.filter((task) => !task.completed);
  const visibleLater = useMemo(
    () => remaining
      .filter((task) => task.id !== activeTask?.id && task.id !== nextTask?.id)
      .slice(0, supportPreset.maxLaterTasks),
    [remaining, activeTask?.id, nextTask?.id, supportPreset.maxLaterTasks]
  );

  const surface = visualSensitive ? 'bg-[#fafaf7] border-[#d8d8d0]' : 'bg-white border-outline-variant/60';
  const taskAccent = visualSensitive ? 'bg-[#ecece6] text-[#273029]' : 'bg-primary-fixed text-primary';

  return (
    <main className={`min-h-screen px-5 py-7 max-w-3xl mx-auto ${reduceMotion ? '[&_*]:transition-none [&_*]:animate-none' : ''}`}>
      <header className="flex items-center justify-between gap-3 mb-7">
        <div><p className="text-sm opacity-70">Olá,</p><h1 className="text-3xl font-extrabold">{profile.name}</h1></div>
        {role === 'responsavel' ? (
          <button onClick={onBackToResponsible} className="rounded-2xl border-2 border-outline-variant px-4 py-2.5 font-bold text-sm">Área do responsável</button>
        ) : <button onClick={onLeaveRoom} className="rounded-2xl border-2 border-outline-variant px-4 py-2.5 font-bold text-sm">Sair do perfil</button>}
      </header>

      {isResponsiblePreview && (
        <div className="rounded-2xl border-2 border-primary bg-primary-fixed p-4 mb-5">
          <strong>Visualização do responsável</strong>
          <p className="text-sm opacity-75 mt-1">Você está vendo como o NeuroGuia aparece para o estudante. Nenhuma ação ou progresso será salvo.</p>
        </div>
      )}

      <div className={`rounded-2xl border p-4 mb-4 flex items-center justify-between ${surface}`}><div><strong>Seu companheiro: {gameProgress?.mascot || 'coruja'}</strong><p className="text-sm opacity-70">Cada conquista fortalece sua autonomia.</p></div><div className="text-xl font-extrabold">⭐ {gameProgress?.stars || 0}</div></div>

      {soundSensitive && (
        <div className={`rounded-2xl border p-4 mb-4 ${surface}`}>
          <strong>Modo silencioso ativo</strong>
          <p className="text-sm opacity-70 mt-1">Sons automáticos foram desativados conforme o perfil sensorial.</p>
        </div>
      )}

      {audioMode && !soundSensitive && (
        <button onClick={() => setAudioEnabled(!audioEnabled)} className={`w-full rounded-2xl border p-4 mb-4 text-left ${surface}`}>
          <strong>{audioEnabled ? '🔊 Áudio ativado' : '🔇 Áudio desativado'}</strong>
          <p className="text-sm opacity-70 mt-1">Toque para {audioEnabled ? 'silenciar' : 'ouvir'} as orientações.</p>
        </button>
      )}

      {profile.routineChangeWarning && routineChanges.filter((item) => !item.acknowledged).map((notice) => (
        <div key={notice.id} className={`rounded-2xl border p-4 mb-4 ${visualSensitive ? 'bg-[#f1eee4] border-[#c9c3ae]' : 'bg-primary-fixed border-primary-fixed-dim'}`}>
          <div className="flex gap-3 items-start"><span className="material-symbols-outlined">notification_important</span><div className="flex-1"><strong>{notice.title}</strong><p className="text-sm opacity-75 mt-1">{notice.description}</p><p className="text-xs opacity-60 mt-2">{new Date(notice.effectiveAt).toLocaleString('pt-BR')}</p></div></div>
          <button onClick={() => isResponsiblePreview ? setHelpMessage('Confirmação simulada. O aviso continua pendente para o estudante.') : onAcknowledgeChange(notice.id)} className="mt-3 rounded-xl bg-white/80 px-4 py-2 text-sm font-extrabold">{isResponsiblePreview ? 'Simular confirmação' : 'Entendi a mudança'}</button>
        </div>
      ))}

      {profile.routineChangeWarning && !routineChanges.some((item) => !item.acknowledged) && (
        <div className={`rounded-2xl border p-4 mb-5 flex gap-3 items-start ${surface}`}>
          <span className="material-symbols-outlined">event_note</span>
          <div><strong>Hoje está tudo como planejado.</strong><p className="text-sm opacity-70 mt-1">Se algo mudar, o NeuroGuia vai avisar aqui.</p></div>
        </div>
      )}

      {helpMessage && (
        <div className={`rounded-2xl border p-4 mb-5 font-bold ${visualSensitive ? 'bg-[#ecece6] border-[#c9c9c0]' : 'bg-tertiary-fixed border-tertiary-container'}`}>
          {helpMessage}
        </div>
      )}

      {!activeTask && nextTask && (
        <section className={`rounded-3xl border p-6 shadow-sm mb-5 ${surface}`}>
          <p className="text-xs font-extrabold uppercase tracking-wider opacity-60">Agora</p>
          {imageMode && (
            <div className={`my-5 w-20 h-20 rounded-3xl flex items-center justify-center ${taskAccent}`}>
              <span className="material-symbols-outlined text-4xl">task_alt</span>
            </div>
          )}
          <h2 className="text-3xl font-extrabold">{nextTask.title}</h2>
          <p className="mt-2 text-sm opacity-70">{nextTask.time}</p>
          <button onClick={() => startTask(nextTask)} className={`w-full mt-6 rounded-2xl py-4 text-lg font-extrabold ${visualSensitive ? 'bg-[#455348] text-white' : 'bg-primary text-white'}`}>Começar</button>
        </section>
      )}

      {activeTask && (
        <section className={`rounded-3xl border p-6 shadow-sm mb-5 ${surface}`}>
          <p className="text-xs font-extrabold uppercase tracking-wider opacity-60">Fazendo agora</p>
          <h2 className="text-2xl font-extrabold mt-2">{activeTask.title}</h2>
          {profile.stepByStep && activeTask.steps?.length ? (
            <div className="mt-6">
              <div className="text-sm font-bold opacity-60 mb-2">Etapa {stepIndex + 1} de {activeTask.steps.length}</div>
              <div className={`rounded-2xl p-6 text-xl font-extrabold ${visualSensitive ? 'bg-[#ecece6]' : 'bg-surface-container-low'}`}>{activeTask.steps[stepIndex]}</div>
              {audioEnabled && !soundSensitive && <button onClick={() => speak(activeTask.steps![stepIndex])} className="mt-3 rounded-xl border-2 border-outline-variant px-4 py-2 font-bold">🔊 Ouvir etapa</button>}
              {stepIndex < activeTask.steps.length - 1 ? (
                <button onClick={() => { const next = stepIndex + 1; setStepIndex(next); speak(activeTask.steps![next]); }} className={`w-full mt-4 rounded-2xl py-4 font-extrabold ${visualSensitive ? 'bg-[#455348] text-white' : 'bg-primary text-white'}`}>Consegui, próxima etapa</button>
              ) : (
                <button disabled={pendingAction === 'concluir'} onClick={completeActive} className="w-full mt-4 rounded-2xl bg-tertiary text-white py-4 font-extrabold disabled:opacity-60">{pendingAction === 'concluir' ? 'Salvando...' : 'Terminei ✓'}</button>
              )}
            </div>
          ) : (
            <button disabled={pendingAction === 'concluir'} onClick={completeActive} className="w-full mt-6 rounded-2xl bg-tertiary text-white py-4 font-extrabold disabled:opacity-60">{pendingAction === 'concluir' ? 'Salvando...' : 'Concluir tarefa ✓'}</button>
          )}
        </section>
      )}

      {visibleLater.length > 0 && (
        <section className={`rounded-3xl border p-5 mb-5 ${surface}`}>
          <h2 className="font-extrabold text-lg mb-3">Depois</h2>
          <div className="space-y-2">
            {visibleLater.map((task) => (
              <button key={task.id} onClick={() => startTask(task)} className={`w-full rounded-2xl p-4 text-left ${visualSensitive ? 'bg-[#ecece6]' : 'bg-surface-container-low'}`}>
                <div className="font-bold">{task.title}</div><div className="text-xs opacity-60 mt-1">{task.time}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {profile.helpButton && (
        <button disabled={isResponsiblePreview || pendingAction === 'me-perdi'} onClick={openHelp} title={isResponsiblePreview ? 'Disponível somente no acesso do estudante' : undefined} className={`w-full rounded-3xl border-2 py-4 font-extrabold text-lg flex items-center justify-center gap-2 disabled:opacity-50 ${visualSensitive ? 'border-[#66756a] bg-[#ecece6] text-[#273029]' : 'border-secondary bg-secondary-fixed text-secondary'}`}>
          <span className="material-symbols-outlined">help</span>{isResponsiblePreview ? 'Me perdi — somente estudante' : pendingAction === 'me-perdi' ? 'Avisando...' : 'Me perdi'}
        </button>
      )}

      {helpOpen && (
        <div className="fixed inset-0 bg-black/35 p-5 flex items-end sm:items-center justify-center z-50">
          <section className={`w-full max-w-md rounded-3xl p-6 shadow-xl ${visualSensitive ? 'bg-[#fafaf7]' : 'bg-white'}`}>
            <h2 className="text-2xl font-extrabold">Vamos continuar juntos.</h2>
            <p className="mt-2 text-sm opacity-70">Agora você precisa fazer:</p>
            <div className={`rounded-2xl p-4 my-4 text-lg font-extrabold ${visualSensitive ? 'bg-[#ecece6]' : 'bg-surface-container-low'}`}>{currentHelpTask?.title || 'Sua próxima tarefa'}</div>
            <div className="grid gap-2">
              {currentHelpTask?.steps?.length ? (
                <button disabled={Boolean(pendingAction)} onClick={() => startTask(currentHelpTask)} className={`rounded-2xl py-3.5 font-extrabold disabled:opacity-60 ${visualSensitive ? 'bg-[#455348] text-white' : 'bg-primary text-white'}`}>Mostrar passo a passo</button>
              ) : null}
              <button onClick={() => { setHelpOpen(false); setHelpMessage('Tudo certo. Continue quando estiver pronto.'); }} className="rounded-2xl border-2 border-outline-variant py-3.5 font-extrabold">Entendi</button>
              <button disabled={Boolean(pendingAction)} onClick={() => registerSupport('nao-entendi', 'O responsável recebeu que você não entendeu.')} className="rounded-2xl border-2 border-primary text-primary py-3.5 font-extrabold disabled:opacity-60">{pendingAction === 'nao-entendi' ? 'Enviando...' : 'Não entendi'}</button>
              <button disabled={Boolean(pendingAction)} onClick={() => registerSupport('ajuda', 'Pedido de ajuda enviado ao responsável.')} className="rounded-2xl border-2 border-secondary text-secondary py-3.5 font-extrabold disabled:opacity-60">{pendingAction === 'ajuda' ? 'Enviando...' : 'Pedir ajuda ao responsável'}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
