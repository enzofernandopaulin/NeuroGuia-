import React, { useState, useEffect } from 'react';
import { Classroom, AppView, ClassroomMaterial, ClassroomMessage, RoomStudent } from '../types';

interface StudentRoomViewProps {
  classrooms: Classroom[];
  joinedRoomIds?: string[];
  selectedRoomId?: string;
  onSelectRoom?: (roomId: string) => void;
  onJoinRoomCode?: (code: string) => void;
  setCurrentView: (view: AppView) => void;
  userName?: string;
  onAddCoins?: (amount: number) => void;
  onUpdateRoom?: (updatedRoom: Classroom) => void;
}

export const StudentRoomView: React.FC<StudentRoomViewProps> = ({
  classrooms,
  joinedRoomIds,
  selectedRoomId,
  onSelectRoom,
  onJoinRoomCode,
  setCurrentView,
  userName = 'Membro',
  onAddCoins,
  onUpdateRoom,
}) => {
  // Filter rooms that member has actually joined
  const joinedClassrooms = classrooms.filter((c) =>
    joinedRoomIds ? joinedRoomIds.includes(c.id) : false
  );

  const [activeRoomId, setActiveRoomId] = useState<string>(
    selectedRoomId || joinedClassrooms[0]?.id || ''
  );

  const [inlineCode, setInlineCode] = useState('');

  useEffect(() => {
    if (selectedRoomId && joinedClassrooms.some((c) => c.id === selectedRoomId)) {
      setActiveRoomId(selectedRoomId);
    } else if (joinedClassrooms.length > 0 && !joinedClassrooms.some((c) => c.id === activeRoomId)) {
      setActiveRoomId(joinedClassrooms[0].id);
    }
  }, [selectedRoomId, joinedClassrooms]);

  const activeRoom = joinedClassrooms.find((c) => c.id === activeRoomId) || joinedClassrooms[0];

  // Room Local State (per room interaction persistence in view)
  const [copiedCode, setCopiedCode] = useState(false);
  const [activityCompleted, setActivityCompleted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(15 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [myStatus, setMyStatus] = useState<'foco' | 'pausa' | 'ajuda'>('foco');

  // Wall messages state & filter
  const [wallMessages, setWallMessages] = useState<ClassroomMessage[]>(
    activeRoom?.wallMessages || [
      {
        id: 'wm1',
        author: activeRoom?.hostName || activeRoom?.teacherName || 'Anfitrião',
        role: 'anfitriao',
        content: 'Bem-vindos ao nosso espaço de foco! Qualquer dúvida ou necessidade de apoio, mandem mensagem aqui.',
        timestamp: '09:00',
        likes: 3,
      },
    ]
  );
  const [wallFilter, setWallFilter] = useState<'todos' | 'anfitriao' | 'membros'>('todos');
  const [newPostText, setNewPostText] = useState('');

  // Host Recado Reaction State
  const [recadoReacted, setRecadoReacted] = useState(false);

  // Guided Breathing Exercise Modal
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inspire' | 'segure' | 'expire'>('inspire');
  const [breathingTimer, setBreathingTimer] = useState(4);

  // Materials state
  const [materials, setMaterials] = useState<ClassroomMaterial[]>(
    activeRoom?.materials || [
      { id: 'm1', title: 'Guia_Pratico_De_Organizacao.pdf', type: 'pdf', sizeOrDuration: '2.4 MB' },
      { id: 'm2', title: 'Vídeo: Conceitos Práticos', type: 'video', sizeOrDuration: '4 min' },
    ]
  );
  const [selectedMaterial, setSelectedMaterial] = useState<ClassroomMaterial | null>(null);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatType, setNewMatType] = useState<'pdf' | 'video' | 'audio' | 'link'>('pdf');

  // Members & Encouragement State
  const [studentsList, setStudentsList] = useState<RoomStudent[]>(
    activeRoom?.studentsList || [
      { id: 's1', name: `${userName} (Você)`, status: myStatus, mood: '😊 Feliz' },
      { id: 's2', name: 'Lucas M.', status: 'foco', mood: '😌 Calmo' },
      { id: 's3', name: 'Mariana S.', status: 'pausa', mood: '🥱 Cansado' },
      { id: 's4', name: 'Beatriz L.', status: 'foco', mood: '😊 Feliz' },
    ]
  );
  const [selectedPeerForIncentive, setSelectedPeerForIncentive] = useState<RoomStudent | null>(null);

  // Notifications & Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Sync state when active room changes
  useEffect(() => {
    if (activeRoom) {
      setWallMessages(activeRoom.wallMessages || []);
      setMaterials(activeRoom.materials || []);
      setStudentsList(activeRoom.studentsList || []);
      setActivityCompleted(false);
      setTimerSeconds((activeRoom.currentActivity?.durationMinutes || 15) * 60);
      setTimerRunning(false);
    }
  }, [activeRoomId]);

  // Activity Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerRunning && timerSeconds === 0) {
      setTimerRunning(false);
      if (onAddCoins) onAddCoins(25);
      showToast('🎉 Sessão de foco concluída! Você ganhou +25 Moedas!');
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // Guided Breathing Animation Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showBreathingModal) {
      interval = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev <= 1) {
            if (breathingPhase === 'inspire') {
              setBreathingPhase('segure');
              return 4;
            } else if (breathingPhase === 'segure') {
              setBreathingPhase('expire');
              return 4;
            } else {
              setBreathingPhase('inspire');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showBreathingModal, breathingPhase]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const syncRoomUpdates = (
    updatedMessages = wallMessages,
    updatedMats = materials,
    updatedStudents = studentsList
  ) => {
    if (onUpdateRoom && activeRoom) {
      onUpdateRoom({
        ...activeRoom,
        wallMessages: updatedMessages,
        materials: updatedMats,
        studentsList: updatedStudents,
      });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    showToast('Código da sala copiado com sucesso!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleReactToRecado = () => {
    if (!recadoReacted) {
      setRecadoReacted(true);
      if (onAddCoins) onAddCoins(2);
      showToast('👍 Recado confirmado! +2 Moedas de engajamento!');
    }
  };

  const handleCompleteActivity = () => {
    const nextState = !activityCompleted;
    setActivityCompleted(nextState);
    if (nextState) {
      if (onAddCoins) onAddCoins(25);
      showToast('🎉 Atividade concluída! +50 XP e +25 Moedas adicionadas!');
    }
  };

  const handlePostWallMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg: ClassroomMessage = {
      id: Date.now().toString(),
      author: `${userName} (Você)`,
      role: 'membro',
      content: newPostText.trim(),
      timestamp: timeStr,
      likes: 0,
    };

    const updated = [newMsg, ...wallMessages];
    setWallMessages(updated);
    setNewPostText('');
    syncRoomUpdates(updated, materials, studentsList);
    showToast('Mensagem enviada para o Mural da Sala!');
  };

  const handleLikeMessage = (msgId: string) => {
    const updated = wallMessages.map((m) =>
      m.id === msgId ? { ...m, likes: (m.likes || 0) + 1 } : m
    );
    setWallMessages(updated);
    syncRoomUpdates(updated, materials, studentsList);
  };

  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatTitle.trim()) return;

    const newMat: ClassroomMaterial = {
      id: Date.now().toString(),
      title: newMatTitle.trim(),
      type: newMatType,
      sizeOrDuration: newMatType === 'pdf' ? '1.5 MB' : 'Link Web',
    };

    const updated = [...materials, newMat];
    setMaterials(updated);
    setNewMatTitle('');
    setShowAddMaterialModal(false);
    syncRoomUpdates(wallMessages, updated, studentsList);
    showToast('Novo material compartilhado com a sala!');
  };

  const handleSendIncentive = (phrase: string) => {
    if (!selectedPeerForIncentive) return;
    if (onAddCoins) onAddCoins(5);
    showToast(`Incentivo "${phrase}" enviado para ${selectedPeerForIncentive.name}! ✨ (+5 🪙)`);
    setSelectedPeerForIncentive(null);
  };

  const handleChangeMyStatus = (newStatus: 'foco' | 'pausa' | 'ajuda') => {
    setMyStatus(newStatus);
    const updatedStudents = studentsList.map((s) =>
      s.name.includes('(Você)') ? { ...s, status: newStatus } : s
    );
    setStudentsList(updatedStudents);
    syncRoomUpdates(wallMessages, materials, updatedStudents);

    if (newStatus === 'ajuda') {
      showToast('Status alterado para "Preciso de Apoio". Anfitrião notificado silenciosamente.');
    } else if (newStatus === 'pausa') {
      showToast('Status alterado para "Em Pausa". Bom descanso!');
    } else {
      showToast('Status alterado para "Em Foco". Bons estudos e trabalho!');
    }
  };

  if (!activeRoom || joinedClassrooms.length === 0) {
    return (
      <div className="pt-20 pb-28 px-4 max-w-lg mx-auto flex flex-col gap-5">
        {/* Module Header Badge */}
        <div className="flex items-center justify-between bg-primary-container/30 border border-primary/20 px-4 py-2.5 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">person</span>
            <span className="font-extrabold text-xs text-primary uppercase tracking-wider">
              Módulo Membro / Estudante
            </span>
          </div>
          <span className="text-[11px] font-bold text-outline">Espaço do Aluno</span>
        </div>

        {/* Empty Joined Rooms Card */}
        <div className="bg-surface-container-lowest border-2 border-outline-variant/70 rounded-[2rem] p-6 text-center flex flex-col items-center gap-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-primary-container/40 text-primary flex items-center justify-center text-3xl">
            <span className="material-symbols-outlined text-[36px]">meeting_room</span>
          </div>

          <div>
            <h2 className="font-black text-xl text-on-surface">Você não está em nenhuma sala</h2>
            <p className="text-xs text-outline font-medium mt-1.5 max-w-sm leading-relaxed">
              As salas são criadas e gerencidas pelo <strong>Anfitrião (Professor ou Tutor)</strong>. Para entrar e participar das sessões com seus colegas, digite o <strong>Código de Acesso</strong> fornecido a você!
            </p>
          </div>

          {/* Quick Inline Code Form */}
          <div className="w-full bg-surface-container/60 p-4 rounded-2xl border border-outline-variant/50 flex flex-col gap-3 mt-1">
            <span className="text-xs font-black text-on-surface flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-primary text-[16px]">key</span>
              Digite o Código da Sala (ex: X7K-9P2)
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={inlineCode}
                onChange={(e) => setInlineCode(e.target.value.toUpperCase())}
                placeholder="EX: X7K-9P2"
                className="flex-1 px-4 py-3 bg-surface rounded-xl border border-outline-variant font-mono text-center font-black text-sm text-primary tracking-widest focus:outline-none focus:border-primary"
                maxLength={8}
              />
              <button
                type="button"
                onClick={() => {
                  if (inlineCode.trim()) {
                    if (onJoinRoomCode) onJoinRoomCode(inlineCode.trim());
                    setInlineCode('');
                  }
                }}
                className="px-5 py-3 bg-primary text-on-primary font-black text-xs rounded-xl border-b-2 border-on-primary-fixed-variant hover:bg-primary/90 cursor-pointer shadow-xs"
              >
                Entrar
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 my-1 w-full">
            <div className="h-px bg-outline-variant/50 flex-1" />
            <span className="text-[10px] font-bold text-outline uppercase">ou</span>
            <div className="h-px bg-outline-variant/50 flex-1" />
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('join-room')}
            className="w-full py-3.5 bg-secondary-container text-on-secondary-container font-black text-xs rounded-2xl border border-secondary/30 hover:bg-secondary-container/80 cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">pin</span>
            <span>Usar Teclado de 6 Dígitos Completo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-28 px-4 max-w-xl mx-auto flex flex-col gap-5">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-on-primary px-5 py-3 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 animate-fadeIn border-2 border-on-primary/20">
          <span className="material-symbols-outlined text-[18px]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Module Header Badge */}
      <div className="flex items-center justify-between bg-primary-container/30 border border-primary/20 px-4 py-2.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">person</span>
          <span className="font-extrabold text-xs text-primary uppercase tracking-wider">
            Módulo Membro / Estudante
          </span>
        </div>
        <span className="text-[11px] font-bold text-outline">
          {joinedClassrooms.length} {joinedClassrooms.length === 1 ? 'Sala Conectada' : 'Salas Conectadas'}
        </span>
      </div>

      {/* Top Room Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {joinedClassrooms.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => {
              setActiveRoomId(room.id);
              if (onSelectRoom) onSelectRoom(room.id);
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all cursor-pointer border-2 ${
              activeRoomId === room.id
                ? 'bg-primary text-on-primary border-primary shadow-sm scale-102'
                : 'bg-surface-container-highest text-on-surface border-outline-variant/60 hover:bg-surface-container-high'
            }`}
          >
            {room.name}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setCurrentView('join-room')}
          className="px-3.5 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap bg-secondary-container text-on-secondary-container border-2 border-secondary-container/60 flex items-center gap-1.5 hover:bg-secondary-container/80 transition-all cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Entrar em Outra Sala</span>
        </button>
      </div>

      {/* Hero Classroom Card */}
      <section className="bg-surface-container-lowest rounded-[2.5rem] p-6 border-2 border-outline-variant/70 shadow-xs flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-container/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div>
            <h1 className="font-black text-2xl text-on-surface leading-tight">
              {activeRoom.name}
            </h1>
            <p className="text-xs font-bold text-primary mt-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              <span>Anfitrião: {activeRoom.hostName || activeRoom.teacherName || 'Anfitrião'}</span>
            </p>
          </div>

          {/* Code Access Pill */}
          <button
            type="button"
            onClick={() => handleCopyCode(activeRoom.code)}
            className="shrink-0 bg-surface-container-low border-2 border-outline-variant/80 px-3.5 py-2 rounded-2xl flex flex-col items-center hover:bg-surface-container transition-all cursor-pointer"
            title="Clique para copiar o código"
          >
            <span className="text-[9px] font-black text-outline uppercase tracking-widest">
              Código
            </span>
            <span className="font-mono font-black text-sm text-primary tracking-wider flex items-center gap-1">
              {activeRoom.code}
              <span className="material-symbols-outlined text-[14px]">
                {copiedCode ? 'check' : 'content_copy'}
              </span>
            </span>
          </button>
        </div>

        {/* Live Active Connected Bar */}
        <div className="flex items-center justify-between p-3.5 bg-surface-container/60 rounded-2xl border border-outline-variant/40">
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-[11px] flex items-center justify-center border-2 border-surface">
                A
              </div>
              <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary font-bold text-[11px] flex items-center justify-center border-2 border-surface">
                L
              </div>
              <div className="w-7 h-7 rounded-full bg-tertiary text-on-tertiary font-bold text-[11px] flex items-center justify-center border-2 border-surface">
                M
              </div>
            </div>
            <span className="text-xs font-bold text-on-surface">
              {studentsList.length || activeRoom.activeStudents} Membros Conectados
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-tertiary bg-tertiary-container/30 px-3 py-1 rounded-full border border-tertiary/20">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
            <span>Sala Ativa</span>
          </div>
        </div>

        {/* My Status Controls in Room */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-outline-variant/40">
          <span className="text-[11px] font-black text-outline uppercase tracking-wider">
            Seu Status nesta Sala:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleChangeMyStatus('foco')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                myStatus === 'foco'
                  ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-500/50 font-black'
                  : 'bg-surface-container text-on-surface border-outline-variant/60'
              }`}
            >
              <span>🟢</span>
              <span>Em Foco</span>
            </button>

            <button
              type="button"
              onClick={() => handleChangeMyStatus('pausa')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                myStatus === 'pausa'
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/50 font-black'
                  : 'bg-surface-container text-on-surface border-outline-variant/60'
              }`}
            >
              <span>☕</span>
              <span>Em Pausa</span>
            </button>

            <button
              type="button"
              onClick={() => handleChangeMyStatus('ajuda')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                myStatus === 'ajuda'
                  ? 'bg-rose-500/20 text-rose-800 dark:text-rose-200 border-rose-500/50 font-black'
                  : 'bg-surface-container text-on-surface border-outline-variant/60'
              }`}
            >
              <span>🆘</span>
              <span>Preciso Apoio</span>
            </button>
          </div>
        </div>
      </section>

      {/* Host Broadcast Message */}
      {activeRoom.broadcastMessage && (
        <section className="bg-primary-container/30 border-2 border-primary-container text-on-primary-container p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-xs relative">
          <div className="flex items-start gap-3.5 flex-1">
            <div className="w-11 h-11 shrink-0 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[24px]">campaign</span>
            </div>
            <div className="flex-1">
              <h2 className="font-black text-xs uppercase tracking-wider text-primary mb-1 flex items-center gap-1">
                <span>Recado do Anfitrião</span>
              </h2>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                "{activeRoom.broadcastMessage}"
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReactToRecado}
            className={`px-3.5 py-2 rounded-2xl font-black text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer border ${
              recadoReacted
                ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-500/50'
                : 'bg-primary text-on-primary border-primary hover:bg-primary/90 shadow-xs'
            }`}
          >
            <span>{recadoReacted ? '👍 Entendido!' : 'Confirmar Leitura (+2 🪙)'}</span>
          </button>
        </section>
      )}

      {/* Current Room Activity / Timer Section (Atividade Acadêmica Foco da Sala) */}
      {activeRoom.currentActivity && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">menu_book</span>
                <span>📚 Atividade Acadêmica da Sala</span>
              </h2>
              <p className="text-[11px] text-outline font-semibold">
                Conteúdo pedagógico de estudo definido pelo anfitrião
              </p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary-container/40 px-3 py-1 rounded-full border border-primary/20">
              {activeRoom.currentActivity.durationMinutes} min de estudo
            </span>
          </div>

          <div className="bg-surface-container text-on-surface rounded-[2rem] p-5 border-2 border-outline-variant/60 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="font-black text-base sm:text-lg text-on-surface">
                {activeRoom.currentActivity.title}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed font-medium">
                {activeRoom.currentActivity.description}
              </p>
            </div>

            {/* Timer Block */}
            <div className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/60">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">timer</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-outline uppercase tracking-wider block">
                    Temporizador da Atividade
                  </span>
                  <span className="font-mono text-2xl font-black text-primary">
                    {formatTimer(timerSeconds)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="bg-primary text-on-primary px-4 py-2.5 rounded-xl font-black text-xs border-b-2 border-on-primary-fixed-variant active:translate-y-0.5 cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {timerRunning ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{timerRunning ? 'Pausar' : 'Iniciar'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCompleteActivity}
                  className={`px-3 py-2.5 rounded-xl font-black text-xs cursor-pointer flex items-center gap-1 transition-all ${
                    activityCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>{activityCompleted ? 'Concluída!' : 'Concluir (+50 XP)'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Room Daily Missions from Host Checklist (Missões Gamificadas) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[24px]">stars</span>
              <span>🎯 Missões Gamificadas da Sala</span>
            </h2>
            <p className="text-[11px] text-outline font-semibold">
              Desafios e conquistas que valem XP e Moedas para o Mascote
            </p>
          </div>
          <span className="text-[11px] font-black text-secondary bg-secondary-container/40 px-3 py-1 rounded-full border border-secondary/20">
            Recompensas Gamificadas
          </span>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-5 border-2 border-outline-variant/60 shadow-xs flex flex-col gap-3">
          {(!activeRoom.dailyMissions || activeRoom.dailyMissions.length === 0) ? (
            <div className="p-4 bg-surface-container/30 rounded-2xl border border-dashed border-outline-variant text-center text-xs font-medium text-outline">
              Nenhuma missão gamificada atribuída para esta sala no momento.
            </div>
          ) : (
            activeRoom.dailyMissions.map((mission) => (
              <div
                key={mission.id}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                  mission.completed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-on-surface'
                    : 'bg-surface border-outline-variant hover:border-secondary shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !mission.completed;
                      mission.completed = nextState;
                      mission.current = nextState ? mission.target : 0;
                      if (nextState) {
                        if (onAddCoins) onAddCoins(mission.xp);
                        showToast(`🎉 Missão do Anfitrião concluída! +${mission.xp} XP e moedas!`);
                      }
                      if (onUpdateRoom) {
                        onUpdateRoom({
                          ...activeRoom,
                          dailyMissions: activeRoom.dailyMissions ? [...activeRoom.dailyMissions] : [],
                        });
                      }
                    }}
                    className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      mission.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-outline-variant bg-surface hover:border-secondary'
                    }`}
                  >
                    {mission.completed && <span className="material-symbols-outlined text-[20px]">check</span>}
                  </button>
                  <div>
                    <h4 className={`font-bold text-sm text-on-surface ${mission.completed ? 'line-through opacity-70' : ''}`}>
                      {mission.title}
                    </h4>
                    <p className="text-xs text-outline font-medium flex items-center gap-1.5 mt-0.5">
                      <span>⭐ +{mission.xp} XP</span>
                      {mission.targetMember && (
                        <span className="bg-secondary-container/50 text-secondary font-bold px-2 py-0.5 rounded-md text-[10px]">
                          👤 Para: {mission.targetMember}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    mission.completed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-secondary-container text-on-secondary-container'
                  }`}
                >
                  {mission.completed ? 'Concluída' : 'Realizar'}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Room Wall & Discussions */}
      <section className="bg-surface-container-lowest p-5 rounded-[2rem] border-2 border-outline-variant/60 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-outline-variant/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">forum</span>
            <h2 className="font-black text-lg text-on-surface">Mural & Recados da Sala</h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl border border-outline-variant/50">
            <button
              type="button"
              onClick={() => setWallFilter('todos')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                wallFilter === 'todos'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setWallFilter('anfitriao')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                wallFilter === 'anfitriao'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Anfitrião
            </button>
            <button
              type="button"
              onClick={() => setWallFilter('membros')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                wallFilter === 'membros'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Membros
            </button>
          </div>
        </div>

        {/* Post Input Box */}
        <form onSubmit={handlePostWallMessage} className="flex flex-col gap-2">
          <div className="relative">
            <input
              type="text"
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="Escreva um recado ou dúvida para o grupo..."
              className="w-full p-3.5 pr-12 rounded-2xl bg-surface border-2 border-outline-variant/60 focus:border-primary text-on-surface text-sm font-semibold outline-hidden transition-colors"
            />
            <button
              type="submit"
              disabled={!newPostText.trim()}
              className="absolute right-2 top-2 p-2 bg-primary text-on-primary rounded-xl disabled:opacity-40 transition-all cursor-pointer hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </form>

        {/* Messages Feed */}
        <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1">
          {wallMessages.filter((m) =>
            wallFilter === 'todos'
              ? true
              : wallFilter === 'anfitriao'
              ? m.role === 'anfitriao' || m.role === 'tutor'
              : m.role !== 'anfitriao' && m.role !== 'tutor'
          ).length === 0 ? (
            <p className="text-center text-xs text-outline font-semibold py-4">
              Nenhuma mensagem encontrada neste filtro.
            </p>
          ) : (
            wallMessages
              .filter((m) =>
                wallFilter === 'todos'
                  ? true
                  : wallFilter === 'anfitriao'
                  ? m.role === 'anfitriao' || m.role === 'tutor'
                  : m.role !== 'anfitriao' && m.role !== 'tutor'
              )
              .map((msg) => (
              <div
                key={msg.id}
                className="p-3.5 rounded-2xl bg-surface border border-outline-variant/50 flex flex-col gap-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-on-surface">{msg.author}</span>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        msg.role === 'anfitriao' || msg.role === 'tutor'
                          ? 'bg-primary-container text-primary border border-primary/20'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {msg.role === 'anfitriao' || msg.role === 'tutor' ? 'Anfitrião' : 'Membro'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-outline">{msg.timestamp}</span>
                </div>

                <p className="text-xs text-on-surface font-medium leading-relaxed">
                  {msg.content}
                </p>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleLikeMessage(msg.id)}
                    className="flex items-center gap-1 text-[11px] font-bold text-outline hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">favorite</span>
                    <span>{msg.likes || 0}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Room Materials Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-lg text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[24px]">folder_shared</span>
            <span>Materiais Compartilhados</span>
          </h2>

          <button
            type="button"
            onClick={() => setShowAddMaterialModal(true)}
            className="text-xs font-black text-primary bg-primary-container/40 hover:bg-primary-container/70 px-3 py-1.5 rounded-full flex items-center gap-1 border border-primary/20 cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Compartilhar Material</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="p-4 rounded-2xl bg-surface-container-lowest border-2 border-outline-variant/60 flex items-center justify-between hover:border-primary transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary-container/40 text-tertiary flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-[22px]">
                    {mat.type === 'pdf'
                      ? 'description'
                      : mat.type === 'video'
                      ? 'play_circle'
                      : mat.type === 'audio'
                      ? 'audiotrack'
                      : 'link'}
                  </span>
                </div>
                <div>
                  <p className="font-black text-xs sm:text-sm text-on-surface">{mat.title}</p>
                  <p className="text-[11px] font-bold text-outline">
                    {mat.type.toUpperCase()} • {mat.sizeOrDuration || 'Disponível'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMaterial(mat)}
                className="bg-surface-container text-primary font-black text-xs px-3.5 py-2 rounded-xl border border-outline-variant hover:bg-primary-container/30 transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Visualizar</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Classmates & Peer Encouragement List */}
      <section className="flex flex-col gap-3">
        <h2 className="font-black text-lg text-on-surface flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">group</span>
            <span>Membros Conectados</span>
          </span>
          <span className="text-xs text-outline font-bold">
            {studentsList.length} ativos
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {studentsList.map((st) => (
            <div
              key={st.id}
              className="p-3.5 rounded-2xl bg-surface-container-lowest border-2 border-outline-variant/50 flex items-center justify-between gap-2 shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container font-black text-xs flex items-center justify-center shrink-0 border border-secondary/20">
                  {st.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="font-black text-xs text-on-surface truncate">{st.name}</p>
                  <p className="text-[10px] font-bold text-outline mt-0.5 flex items-center gap-1">
                    <span>{st.status === 'foco' ? '🟢 Foco' : st.status === 'pausa' ? '☕ Pausa' : '🆘 Apoio'}</span>
                    <span>•</span>
                    <span>{st.mood || 'Conectado'}</span>
                  </p>
                </div>
              </div>

              {!st.name.includes('(Você)') && (
                <button
                  type="button"
                  onClick={() => setSelectedPeerForIncentive(st)}
                  className="px-2.5 py-1.5 bg-tertiary-container/40 text-tertiary hover:bg-tertiary-container text-[11px] font-black rounded-xl border border-tertiary/20 flex items-center gap-1 transition-all cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[14px]">favorite</span>
                  <span>Incentivar</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Silent Help / SOS Action Card */}
      <section className="bg-error-container/20 text-on-error-container rounded-3xl p-5 border-2 border-error/30 flex flex-col gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-error text-on-error flex items-center justify-center shrink-0 shadow-xs">
            <span
              className="material-symbols-outlined text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-on-surface">Precisa de Pausa ou Descompressão?</h3>
            <p className="text-xs text-outline font-semibold mt-0.5">
              Envie um sinal discreto para o anfitrião ou ative as ferramentas de autorregulação.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => setCurrentView('sos-overview')}
            className="flex-1 bg-error text-on-error py-3 rounded-2xl font-black text-xs border-b-2 border-on-error-container active:translate-y-0.5 flex items-center justify-center gap-1 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">favorite</span>
            <span>Ativar Modo SOS</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBreathingModal(true)}
            className="flex-1 bg-secondary-container text-on-secondary-container py-3 rounded-2xl font-black text-xs border border-secondary/30 hover:bg-secondary-container/80 flex items-center justify-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">self_improvement</span>
            <span>Respiração Guiada</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFeedbackSent(true);
              showToast('Sinal silencioso enviado para o anfitrião!');
              setTimeout(() => setFeedbackSent(false), 3000);
            }}
            className="flex-1 bg-surface-container text-on-surface py-3 rounded-2xl font-black text-xs border border-outline-variant hover:bg-surface-container-high flex items-center justify-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span>{feedbackSent ? 'Sinal Enviado!' : 'Sinal Silencioso'}</span>
          </button>
        </div>
      </section>

      {/* MODAL 1: Interactive Material Preview Viewer */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-md border-2 border-outline-variant shadow-2xl flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-container text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[24px]">
                    {selectedMaterial.type === 'pdf'
                      ? 'description'
                      : selectedMaterial.type === 'video'
                      ? 'play_circle'
                      : 'audiotrack'}
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-base text-on-surface">{selectedMaterial.title}</h3>
                  <span className="text-xs font-bold text-outline">
                    {selectedMaterial.type.toUpperCase()} • {selectedMaterial.sizeOrDuration || '1.0 MB'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMaterial(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-on-surface hover:bg-surface-container-high cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Box */}
            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col items-center gap-3 text-center">
              {selectedMaterial.type === 'pdf' && (
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[48px] text-primary">picture_as_pdf</span>
                  <p className="text-xs font-bold text-on-surface">Documento Compartilhado</p>
                  <p className="text-[11px] text-outline">
                    Arquivo disponível no espaço {activeRoom.name}.
                  </p>
                </div>
              )}

              {selectedMaterial.type === 'video' && (
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="w-full aspect-video bg-black/80 rounded-xl flex items-center justify-center text-white relative overflow-hidden">
                    <span className="material-symbols-outlined text-[56px] text-primary animate-pulse">
                      play_circle
                    </span>
                  </div>
                  <p className="text-xs font-bold text-on-surface">Vídeo de Apoio</p>
                </div>
              )}

              {selectedMaterial.type === 'audio' && (
                <div className="flex flex-col items-center gap-2 w-full">
                  <span className="material-symbols-outlined text-[48px] text-tertiary">graphic_eq</span>
                  <p className="text-xs font-bold text-on-surface">Faixa Sonora de Foco</p>
                  <audio controls className="w-full mt-2" />
                </div>
              )}

              {selectedMaterial.type === 'link' && (
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[48px] text-secondary">link</span>
                  <p className="text-xs font-bold text-on-surface">Link do Projeto / Guia</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  showToast('Download do material iniciado!');
                  setSelectedMaterial(null);
                }}
                className="flex-1 bg-primary text-on-primary font-black text-xs py-3 rounded-2xl border-b-2 border-on-primary-fixed-variant shadow-xs cursor-pointer"
              >
                Acessar Material
              </button>

              <button
                type="button"
                onClick={() => setSelectedMaterial(null)}
                className="px-4 bg-surface-container text-on-surface font-bold text-xs py-3 rounded-2xl border border-outline-variant cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Material Modal */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-sm border-2 border-outline-variant shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-base text-on-surface">Compartilhar Material</h3>
              <button
                type="button"
                onClick={() => setShowAddMaterialModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-on-surface cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMaterialSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-black text-outline mb-1">Título do Material:</label>
                <input
                  type="text"
                  required
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  placeholder="Ex: Guia Prático, Playlist de Foco..."
                  className="w-full p-3 bg-surface border-2 border-outline-variant/60 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-outline mb-1">Tipo:</label>
                <select
                  value={newMatType}
                  onChange={(e) => setNewMatType(e.target.value as any)}
                  className="w-full p-3 bg-surface border-2 border-outline-variant/60 rounded-xl text-xs font-semibold"
                >
                  <option value="pdf">Documento / Guia PDF</option>
                  <option value="video">Vídeo</option>
                  <option value="audio">Áudio / Música de Foco</option>
                  <option value="link">Link Web</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-primary text-on-primary font-black text-xs rounded-xl border-b-2 border-on-primary-fixed-variant cursor-pointer shadow-xs"
              >
                Publicar para a Sala
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Send Peer Encouragement Popover */}
      {selectedPeerForIncentive && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-xs border-2 border-outline-variant shadow-2xl flex flex-col gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl">💖</span>
              <h3 className="font-black text-base text-on-surface">
                Incentivar {selectedPeerForIncentive.name}
              </h3>
              <p className="text-xs text-outline font-semibold">
                Escolha uma mensagem positiva para enviar agora:
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSendIncentive('🎯 Força! Excelente foco!')}
                className="p-3 rounded-xl bg-surface-container hover:bg-primary-container/30 text-on-surface font-bold text-xs border border-outline-variant/60 cursor-pointer text-left flex items-center gap-2"
              >
                <span>🎯</span>
                <span>Força! Excelente foco!</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendIncentive('⭐ Mandou muito bem!')}
                className="p-3 rounded-xl bg-surface-container hover:bg-primary-container/30 text-on-surface font-bold text-xs border border-outline-variant/60 cursor-pointer text-left flex items-center gap-2"
              >
                <span>⭐</span>
                <span>Mandou muito bem!</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendIncentive('💙 Tamo junto no objetivo!')}
                className="p-3 rounded-xl bg-surface-container hover:bg-primary-container/30 text-on-surface font-bold text-xs border border-outline-variant/60 cursor-pointer text-left flex items-center gap-2"
              >
                <span>💙</span>
                <span>Tamo junto no objetivo!</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendIncentive('☕ Lembre-se de beber água e descansar!')}
                className="p-3 rounded-xl bg-surface-container hover:bg-primary-container/30 text-on-surface font-bold text-xs border border-outline-variant/60 cursor-pointer text-left flex items-center gap-2"
              >
                <span>☕</span>
                <span>Lembre-se de beber água!</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPeerForIncentive(null)}
              className="text-xs font-bold text-outline hover:text-on-surface py-2 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Guided Breathing Exercise Modal */}
      {showBreathingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-sm border-2 border-outline-variant shadow-2xl flex flex-col items-center gap-5 text-center">
            <div className="flex justify-between items-center w-full">
              <h3 className="font-black text-base text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[22px]">self_improvement</span>
                Pausa de Respiração 4-4-4
              </h3>
              <button
                type="button"
                onClick={() => setShowBreathingModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-on-surface cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Breathing Visualizer Circle */}
            <div className="relative w-36 h-36 flex items-center justify-center my-2">
              <div
                className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                  breathingPhase === 'inspire'
                    ? 'bg-primary/30 scale-110 border-4 border-primary'
                    : breathingPhase === 'segure'
                    ? 'bg-amber-500/30 scale-105 border-4 border-amber-500'
                    : 'bg-emerald-500/30 scale-90 border-4 border-emerald-500'
                }`}
              />
              <div className="z-10 flex flex-col items-center">
                <span className="font-mono text-3xl font-black text-on-surface">
                  {breathingTimer}s
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-primary mt-1">
                  {breathingPhase === 'inspire'
                    ? '🫁 Inspire...'
                    : breathingPhase === 'segure'
                    ? '✋ Segure...'
                    : '😮‍💨 Expire...'}
                </span>
              </div>
            </div>

            <p className="text-xs text-outline font-semibold">
              Siga o ritmo da respiração para desacelerar seus batimentos e recuperar a clareza mental.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowBreathingModal(false);
                if (onAddCoins) onAddCoins(10);
                showToast('✨ Excelente autorregulação! +10 Moedas adicionadas!');
              }}
              className="w-full py-3 bg-primary text-on-primary font-black text-xs rounded-2xl border-b-2 border-on-primary-fixed-variant cursor-pointer shadow-xs"
            >
              Concluir Pausa (+10 🪙)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
