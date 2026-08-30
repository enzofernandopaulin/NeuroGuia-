import React, { useState } from 'react';
import { Classroom, AppView, RoomStudent, Mission } from '../types';

interface HostDashboardProps {
  classrooms: Classroom[];
  onOpenNewRoomModal: () => void;
  onUpdateRoom?: (updatedRoom: Classroom) => void;
  setCurrentView?: (view: AppView) => void;
  onSendRoomMissions?: (roomId: string, newMissions: Mission[]) => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  classrooms,
  onOpenNewRoomModal,
  onUpdateRoom,
  setCurrentView,
  onSendRoomMissions,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedSosRoom, setSelectedSosRoom] = useState<Classroom | null>(null);

  // Member profile observation state
  const [inspectStudent, setInspectStudent] = useState<RoomStudent | null>(null);
  const [inspectRoom, setInspectRoom] = useState<Classroom | null>(null);
  const [editedNeuroNote, setEditedNeuroNote] = useState<string>('');

  // Broadcast Recado Modal state
  const [broadcastModalRoom, setBroadcastModalRoom] = useState<Classroom | null>(null);
  const [broadcastText, setBroadcastText] = useState('');

  // Edit Activity Modal state
  const [activityModalRoom, setActivityModalRoom] = useState<Classroom | null>(null);
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actDuration, setActDuration] = useState('25');

  // Host Mission Dispatch State
  const [selectedRoomIdForMissions, setSelectedRoomIdForMissions] = useState<string>(classrooms[0]?.id || '');
  const [missionTitle, setMissionTitle] = useState('');
  const [missionXp, setMissionXp] = useState('35');
  const [missionTargetMember, setMissionTargetMember] = useState('Todos');

  // Edit Dispatched Mission State
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingXp, setEditingXp] = useState('35');
  const [editingTargetMember, setEditingTargetMember] = useState('Todos');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentTargetRoom = classrooms.find((c) => c.id === selectedRoomIdForMissions) || classrooms[0];

  const handleSendHostMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionTitle.trim() || !currentTargetRoom) return;

    const xpVal = parseInt(missionXp, 10) || 35;

    const newMission: Mission = {
      id: `m_host_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: missionTitle.trim(),
      description: `Missão enviada pelo Anfitrião da sala ${currentTargetRoom.name}`,
      xp: xpVal,
      current: 0,
      target: 1,
      completed: false,
      icon: 'stars',
      type: 'daily',
      roomId: currentTargetRoom.id,
      roomName: currentTargetRoom.name,
      targetMember: missionTargetMember === 'Todos' ? undefined : missionTargetMember,
      assignedByHost: true,
    };

    if (onSendRoomMissions) {
      onSendRoomMissions(currentTargetRoom.id, [newMission]);
    }

    if (onUpdateRoom) {
      const existingMissions = currentTargetRoom.dailyMissions || [];
      onUpdateRoom({
        ...currentTargetRoom,
        dailyMissions: [newMission, ...existingMissions],
      });
    }

    setMissionTitle('');
    showToast(`✨ Missão "${newMission.title}" (valendo ${xpVal} XP) enviada para ${currentTargetRoom.name}!`);
  };

  const handleDeleteHostMission = (missionId: string) => {
    if (!currentTargetRoom || !onUpdateRoom) return;

    const updatedMissions = (currentTargetRoom.dailyMissions || []).filter((m) => m.id !== missionId);
    onUpdateRoom({
      ...currentTargetRoom,
      dailyMissions: updatedMissions,
    });
    showToast('🗑️ Missão excluída da sala.');
  };

  const handleSaveEditedHostMission = (missionId: string) => {
    if (!currentTargetRoom || !onUpdateRoom || !editingTitle.trim()) return;

    const xpVal = parseInt(editingXp, 10) || 35;

    const updatedMissions = (currentTargetRoom.dailyMissions || []).map((m) => {
      if (m.id === missionId) {
        return {
          ...m,
          title: editingTitle.trim(),
          xp: xpVal,
          targetMember: editingTargetMember === 'Todos' ? undefined : editingTargetMember,
        };
      }
      return m;
    });

    onUpdateRoom({
      ...currentTargetRoom,
      dailyMissions: updatedMissions,
    });

    setEditingMissionId(null);
    showToast('✏️ Missão alterada com sucesso!');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    showToast('Código copiado para a área de transferência!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSaveBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastModalRoom) return;

    const updated = {
      ...broadcastModalRoom,
      broadcastMessage: broadcastText.trim(),
    };

    if (onUpdateRoom) onUpdateRoom(updated);
    setBroadcastModalRoom(null);
    showToast('Recado transmitido com sucesso para a sala!');
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityModalRoom) return;

    const updated = {
      ...activityModalRoom,
      currentActivity: {
        title: actTitle.trim() || 'Sessão de Foco Guiada',
        description: actDesc.trim() || 'Acompanhe as orientações do anfitrião.',
        durationMinutes: parseInt(actDuration, 10) || 25,
        category: 'study' as const,
      },
    };

    if (onUpdateRoom) onUpdateRoom(updated);
    setActivityModalRoom(null);
    showToast('Nova atividade de foco definida para a sala!');
  };

  const handleAddSimulatedMember = (room: Classroom) => {
    const sampleMembers = [
      {
        name: 'Mariana Santos',
        avatarEmoji: '👩‍🎓',
        status: 'foco' as const,
        mood: '😊 Focada',
        currentTask: 'Resumo de Capítulo - História',
        focusMinutesToday: 35,
        sensoryPreferences: 'Prefere ruído branco suave, evita cores muito vibrantes e gosta de temporizadores visuais discretos.',
        neuroNotes: 'Membro muito participativo em sessões de leitura silenciosa.',
        recentMoods: ['😊 Focada', '😌 Calma'],
      },
      {
        name: 'Lucas Mendes',
        avatarEmoji: '👨‍💻',
        status: 'pausa' as const,
        mood: '🥱 Cansado',
        currentTask: 'Exercícios de Lógica & Código',
        focusMinutesToday: 45,
        sensoryPreferences: 'Necessita de pausas curtas de alongamento a cada 20 minutos de estudo.',
        neuroNotes: 'Responde muito bem a reforço positivo e lembretes sutis.',
        recentMoods: ['🥱 Cansado', '⚡ Animado'],
      },
      {
        name: 'Gabriel Torres',
        avatarEmoji: '🧑‍🎨',
        status: 'ajuda' as const,
        mood: '🤯 Sobrecarregado',
        currentTask: 'Organização de Cronograma',
        focusMinutesToday: 15,
        sensoryPreferences: 'Sensível a excesso de estímulos sonoros. Precisa de instruções em etapas curtas.',
        neuroNotes: 'Solicitou apoio para priorizar suas tarefas do dia.',
        recentMoods: ['🤯 Sobrecarregado', '😌 Calmo'],
      },
    ];

    const currentList = room.studentsList || [];
    const nextMember = sampleMembers[currentList.length % sampleMembers.length];
    const newMember: RoomStudent = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: 'Membro',
      ...nextMember,
    };

    const updatedList = [...currentList, newMember];
    const updatedRoom = {
      ...room,
      activeStudents: updatedList.length,
      studentsList: updatedList,
    };

    if (onUpdateRoom) onUpdateRoom(updatedRoom);
    showToast(`Membro "${nextMember.name}" adicionado à sala ${room.name}!`);
  };

  const handleResolveSos = (room: Classroom) => {
    const updated = {
      ...room,
      sosAlert: undefined,
    };
    if (onUpdateRoom) onUpdateRoom(updated);
    setSelectedSosRoom(null);
    showToast('Alerta de apoio marcado como resolvido!');
  };

  return (
    <div className="pt-20 pb-28 px-4 max-w-2xl mx-auto flex flex-col gap-6">
      {/* Module Header Badge */}
      <div className="flex items-center justify-between bg-secondary-container/30 border border-secondary/20 px-4 py-2.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[20px]">school</span>
          <span className="font-extrabold text-xs text-secondary uppercase tracking-wider">
            Módulo Anfitrião / Professor
          </span>
        </div>
        <span className="text-[11px] font-bold text-outline">Gestão de Salas & Membros</span>
      </div>

      {/* Header */}
      <section className="flex flex-col gap-1">
        <h1 className="font-bold text-2xl text-on-surface">Painel do Anfitrião</h1>
        <p className="text-sm text-on-surface-variant">
          Acompanhe o engajamento, bem-estar e progresso dos membros nas suas salas de foco. Os membros entram fornecendo o código das salas que você criar.
        </p>
      </section>

      {/* Analytics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mood History Card */}
        <div className="bg-surface-container rounded-3xl p-5 border-2 border-outline-variant/60 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-on-surface flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-primary text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mood
              </span>
              Histórico de Humor
            </h2>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase bg-surface px-2.5 py-1 rounded-full border border-outline-variant">
              Últimos 7 dias
            </span>
          </div>

          {/* Simulated Bar Chart */}
          <div className="h-32 w-full mt-2 relative flex items-end justify-between px-3 pb-2 pt-6">
            <div className="absolute inset-0 flex flex-col justify-between opacity-20 pointer-events-none">
              <div className="w-full h-px bg-outline" />
              <div className="w-full h-px bg-outline" />
              <div className="w-full h-px bg-outline" />
            </div>

            {/* Bars */}
            <div className="flex flex-col items-center gap-1 z-10 group relative">
              <div className="w-7 h-20 bg-secondary rounded-t-md group-hover:bg-primary transition-colors shadow-sm" />
              <span className="font-bold text-[11px] text-on-surface-variant">Seg</span>
              <div className="absolute -top-9 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                Ótimo (80%)
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 z-10 group relative">
              <div className="w-7 h-12 bg-secondary rounded-t-md group-hover:bg-primary transition-colors shadow-sm" />
              <span className="font-bold text-[11px] text-on-surface-variant">Ter</span>
              <div className="absolute -top-9 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                Calmo (60%)
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 z-10 group relative">
              <div className="w-7 h-24 bg-tertiary rounded-t-md group-hover:bg-primary transition-colors shadow-sm" />
              <span className="font-bold text-[11px] text-on-surface-variant">Qua</span>
              <div className="absolute -top-9 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                Excelente (95%)
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 z-10 group relative">
              <div className="w-7 h-16 bg-secondary rounded-t-md group-hover:bg-primary transition-colors shadow-sm" />
              <span className="font-bold text-[11px] text-on-surface-variant">Qui</span>
              <div className="absolute -top-9 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                Bom (70%)
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 z-10 group relative">
              <div className="w-7 h-8 bg-error-container text-on-error-container rounded-t-md group-hover:bg-error transition-colors shadow-sm" />
              <span className="font-bold text-[11px] text-on-surface-variant">Sex</span>
              <div className="absolute -top-9 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                Agitado (35%)
              </div>
            </div>
          </div>
        </div>

        {/* Focus Time Card */}
        <div className="bg-surface-container rounded-3xl p-5 border-2 border-outline-variant/60 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-on-surface flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-tertiary text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                timer
              </span>
              Tempo de Foco
            </h2>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase bg-surface px-2.5 py-1 rounded-full border border-outline-variant">
              Esta Semana
            </span>
          </div>

          <div className="flex items-center gap-4 mt-1">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-surface-variant"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                />
                <circle
                  className="text-tertiary"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="62.8"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-extrabold text-xl text-on-surface">12h</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs text-on-surface leading-snug">
                O tempo de foco está <strong className="font-bold">15% maior</strong> do que a semana passada.
              </p>
              <p className="text-xs font-bold text-tertiary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>Ótimo progresso!</span>
              </p>
            </div>
          </div>
        </div>
      </section>






      {/* HOST MISSION DISPATCH PANEL */}
      <section className="bg-surface-container-lowest border-2 border-primary/40 rounded-3xl p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-outline-variant/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary-container/40 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">stars</span>
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-on-surface flex items-center gap-2">
                <span>Publicar Missão Diária para Membros</span>
              </h2>
              <p className="text-xs text-outline font-medium">
                Envie missões diárias com a recompensa de XP escolhida. As missões aparecerão na página dos membros para que possam concluí-las e evoluir o mascote!
              </p>
            </div>
          </div>
        </div>

        {/* Form to create and send mission */}
        <form onSubmit={handleSendHostMission} className="flex flex-col gap-3.5 bg-surface-container/30 p-4 rounded-2xl border border-outline-variant/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Sala Alvo */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[16px]">meeting_room</span>
                <span>1. Selecione a Sala Alvo:</span>
              </label>
              <select
                value={selectedRoomIdForMissions}
                onChange={(e) => setSelectedRoomIdForMissions(e.target.value)}
                className="w-full px-3 py-2 bg-surface text-on-surface font-bold text-xs rounded-xl border border-outline-variant focus:outline-none focus:border-primary cursor-pointer"
              >
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Destinatário */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-[16px]">person</span>
                <span>2. Membro Destino:</span>
              </label>
              <select
                value={missionTargetMember}
                onChange={(e) => setMissionTargetMember(e.target.value)}
                className="w-full px-3 py-2 bg-surface text-on-surface font-bold text-xs rounded-xl border border-outline-variant focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="Todos">👥 Toda a Sala (Todos os Membros)</option>
                {(currentTargetRoom?.studentsList || []).map((s) => (
                  <option key={s.id} value={s.name}>
                    👤 Para: {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Título e Recompensa em XP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-black text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[16px]">edit_note</span>
                <span>3. Título / Descrição da Missão:</span>
              </label>
              <input
                type="text"
                value={missionTitle}
                onChange={(e) => setMissionTitle(e.target.value)}
                placeholder="Ex: Resolver 15 exercícios de matemática, Ler capítulo 3..."
                className="w-full px-3.5 py-2 bg-surface rounded-xl border border-outline-variant text-xs font-medium text-on-surface focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-amber-500 text-[16px]">stars</span>
                <span>4. Recompensa em XP:</span>
              </label>
              <div className="flex items-center gap-1">
                <select
                  value={missionXp}
                  onChange={(e) => setMissionXp(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-outline-variant text-xs font-black text-primary focus:outline-none cursor-pointer"
                >
                  <option value="20">+20 XP</option>
                  <option value="35">+35 XP (Padrão)</option>
                  <option value="50">+50 XP (Importante)</option>
                  <option value="75">+75 XP (Desafio)</option>
                  <option value="100">+100 XP (Épico)</option>
                  <option value="150">+150 XP (Especial)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botão Enviar */}
          <button
            type="submit"
            className="w-full mt-1 px-4 py-2.5 bg-primary text-on-primary font-black text-xs sm:text-sm rounded-xl hover:bg-primary/90 cursor-pointer shadow-md flex items-center justify-center gap-2 border-b-2 border-on-primary-fixed-variant active:translate-y-0.5 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>Publicar Missão para os Membros (+{missionXp} XP)</span>
          </button>
        </form>

        {/* Published Missions in Selected Room */}
        <div className="flex flex-col gap-2.5 mt-1 pt-3 border-t border-outline-variant/40">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">list_alt</span>
              <span>Missões Ativas na Sala ({currentTargetRoom?.name || 'Selecione uma sala'})</span>
            </h3>
            <span className="text-[11px] font-bold text-outline">
              {(currentTargetRoom?.dailyMissions || []).length} missões ativas
            </span>
          </div>

          {(!currentTargetRoom?.dailyMissions || currentTargetRoom.dailyMissions.length === 0) ? (
            <p className="text-xs text-outline italic text-center py-4 bg-surface rounded-2xl border border-dashed border-outline-variant/60">
              Nenhuma missão enviada para esta sala ainda. Preencha o formulário acima para publicar a primeira missão!
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {currentTargetRoom.dailyMissions.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-surface rounded-2xl border border-outline-variant/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:border-primary transition-all"
                >
                  {editingMissionId === m.id ? (
                    /* Editing Form Inline */
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-surface-container rounded-xl border border-primary text-xs font-bold text-on-surface focus:outline-none"
                        />
                        <select
                          value={editingXp}
                          onChange={(e) => setEditingXp(e.target.value)}
                          className="px-2 py-1.5 bg-surface-container rounded-xl border border-primary text-xs font-black text-primary"
                        >
                          <option value="20">+20 XP</option>
                          <option value="35">+35 XP</option>
                          <option value="50">+50 XP</option>
                          <option value="75">+75 XP</option>
                          <option value="100">+100 XP</option>
                          <option value="150">+150 XP</option>
                        </select>
                        <select
                          value={editingTargetMember}
                          onChange={(e) => setEditingTargetMember(e.target.value)}
                          className="px-2 py-1.5 bg-surface-container rounded-xl border border-primary text-xs font-bold"
                        >
                          <option value="Todos">👥 Todos</option>
                          {(currentTargetRoom?.studentsList || []).map((s) => (
                            <option key={s.id} value={s.name}>
                              👤 {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingMissionId(null)}
                          className="px-3 py-1 rounded-xl bg-surface-container text-xs font-bold text-outline hover:text-on-surface"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditedHostMission(m.id)}
                          className="px-3 py-1 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mission Item */
                    <>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-primary-container/40 text-primary flex items-center justify-center font-black shrink-0 text-xs">
                          ⭐
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-on-surface truncate">{m.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-primary bg-primary-container/30 px-2 py-0.5 rounded-md border border-primary/20">
                              +{m.xp} XP
                            </span>
                            <span className="text-[10px] font-bold text-outline bg-surface-container-high px-2 py-0.5 rounded-md">
                              {m.targetMember ? `👤 Para: ${m.targetMember}` : '👥 Toda a Sala'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMissionId(m.id);
                            setEditingTitle(m.title);
                            setEditingXp(m.xp.toString());
                            setEditingTargetMember(m.targetMember || 'Todos');
                          }}
                          className="px-2.5 py-1 bg-surface-container hover:bg-primary-container/50 text-primary font-bold text-xs rounded-xl border border-outline-variant/60 cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          <span>Alterar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteHostMission(m.id)}
                          className="px-2.5 py-1 bg-surface-container hover:bg-error-container/50 text-error font-bold text-xs rounded-xl border border-outline-variant/60 cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          <span>Excluir</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Room Manager Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl text-on-surface">Gerenciador de Salas de Foco</h2>
          <button
            type="button"
            onClick={onOpenNewRoomModal}
            className="bg-primary text-on-primary font-bold text-xs px-4 py-2.5 rounded-full flex items-center gap-1.5 border-b-4 border-on-primary-fixed-variant active:border-b-0 active:translate-y-1 transition-all shadow-md cursor-pointer hover:bg-primary/95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Nova Sala</span>
          </button>
        </div>

        {/* Room Cards List */}
        <div className="flex flex-col gap-4">
          {classrooms.length === 0 ? (
            <div className="bg-surface-bright border-2 border-dashed border-outline-variant rounded-3xl p-8 flex flex-col items-center text-center gap-3 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-primary-container/40 text-primary flex items-center justify-center text-3xl">
                <span className="material-symbols-outlined text-[36px]">meeting_room</span>
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-on-surface">Nenhuma Sala Criada</h3>
                <p className="text-xs text-outline font-medium mt-1 max-w-md">
                  Como anfitrião, você pode criar salas de foco com código de acesso exclusivo. Os membros poderão entrar para trabalhar e você poderá acompanhar seus perfis, estado de foco e necessidades de apoio!
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenNewRoomModal}
                className="mt-2 bg-primary text-on-primary font-bold text-xs px-5 py-3 rounded-2xl border-b-4 border-on-primary-fixed-variant hover:bg-primary/90 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Criar Minha Primeira Sala</span>
              </button>
            </div>
          ) : (
            classrooms.map((room) => (
              <div
                key={room.id}
                className="bg-surface-bright border-2 border-outline-variant/70 rounded-3xl p-5 flex flex-col gap-4 shadow-sm hover:border-primary transition-all relative overflow-hidden"
              >
                {/* Top Row: Title & Members Count */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-on-surface">{room.name}</h3>
                    </div>

                    <p className="text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">group</span>
                      <span>{room.studentsList?.length || room.activeStudents || 0} Membros Presentes</span>
                    </p>
                  </div>
                </div>

                {/* Access Code Box */}
                <div className="flex flex-col gap-1 bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/50">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Código de Acesso
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xl text-primary tracking-widest">
                      {room.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(room.code)}
                      className="p-2 rounded-xl bg-primary-container/30 text-on-primary-container font-bold text-xs flex items-center gap-1 hover:bg-primary-container/50 transition-all cursor-pointer"
                      title="Copiar código"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {copiedCode === room.code ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedCode === room.code ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Members Present & Profile Observation Box */}
                <div className="flex flex-col gap-2.5 bg-surface-container/40 p-3.5 rounded-2xl border border-outline-variant/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[18px]">group</span>
                      Membros na Sala ({room.studentsList?.length || 0})
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAddSimulatedMember(room)}
                      className="text-[11px] font-black text-primary hover:underline flex items-center gap-1 cursor-pointer bg-primary-container/30 px-2.5 py-1 rounded-lg"
                      title="Simular entrada de membro para teste"
                    >
                      <span className="material-symbols-outlined text-[14px]">person_add</span>
                      <span>+ Simular Entrada de Membro</span>
                    </button>
                  </div>

                  {(!room.studentsList || room.studentsList.length === 0) ? (
                    <p className="text-[11px] text-outline italic py-1">
                      Nenhum membro conectado ainda. Compartilhe o código <strong className="font-mono text-primary">{room.code}</strong> para que entrem na sala!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      {room.studentsList.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setInspectStudent(member);
                            setInspectRoom(room);
                            setEditedNeuroNote(member.neuroNotes || '');
                          }}
                          className="p-2.5 rounded-xl bg-surface border border-outline-variant/60 flex items-center justify-between gap-2 hover:border-primary hover:bg-surface-container-low transition-all cursor-pointer text-left shadow-2xs group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-lg shrink-0">{member.avatarEmoji || '👤'}</span>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-on-surface truncate group-hover:text-primary">
                                {member.name}
                              </p>
                              <p className="text-[10px] text-on-surface-variant font-medium truncate">
                                {member.currentTask || 'Em Foco'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                member.status === 'foco'
                                  ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200'
                                  : member.status === 'pausa'
                                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200'
                                  : member.status === 'ajuda'
                                  ? 'bg-rose-500/20 text-rose-800 dark:text-rose-200'
                                  : 'bg-blue-500/20 text-blue-800 dark:text-blue-200'
                              }`}
                            >
                              {member.status === 'foco'
                                ? 'Foco'
                                : member.status === 'pausa'
                                ? 'Pausa'
                                : member.status === 'ajuda'
                                ? 'Apoio'
                                : 'Online'}
                            </span>
                            <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary">
                              visibility
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* SOS Active Alert Banner if present */}
                {room.sosAlert && (
                  <div className="bg-error-container text-on-error-container p-3.5 rounded-2xl border border-error/30 flex items-center justify-between gap-2 animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-error text-[22px]">
                        warning
                      </span>
                      <div>
                        <p className="font-bold text-xs text-error">Alerta de Apoio Ativo</p>
                        <p className="text-xs font-medium opacity-90">{room.sosAlert}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSosRoom(room)}
                      className="shrink-0 bg-error text-on-error px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm hover:bg-error/90 cursor-pointer"
                    >
                      Ver Detalhes →
                    </button>
                  </div>
                )}

                {/* Bottom Action Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-surface-variant">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastModalRoom(room);
                        setBroadcastText(room.broadcastMessage || '');
                      }}
                      className="px-3 py-2 rounded-xl bg-primary-container/40 text-on-primary-container font-black text-xs border border-primary/20 hover:bg-primary-container/70 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">campaign</span>
                      <span>Transmitir Recado</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActivityModalRoom(room);
                        setActTitle(room.currentActivity?.title || '');
                        setActDesc(room.currentActivity?.description || '');
                        setActDuration(room.currentActivity?.durationMinutes.toString() || '25');
                      }}
                      className="px-3 py-2 rounded-xl bg-tertiary-container/40 text-on-tertiary-container font-black text-xs border border-tertiary/20 hover:bg-tertiary-container/70 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">menu_book</span>
                      <span>Definir Atividade Acadêmica</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {setCurrentView && (
                      <button
                        type="button"
                        onClick={() => setCurrentView('student-room')}
                        className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-black text-xs border-b-2 border-on-primary-fixed-variant hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        <span>Visualizar Sala</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateRoom) {
                          onUpdateRoom({ ...room, name: `${room.name} (Editada)` });
                          showToast(`Nome da sala ${room.name} atualizado!`);
                        }
                      }}
                      className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high cursor-pointer"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Broadcast Recado Modal */}
      {broadcastModalRoom && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-sm border-2 border-outline-variant shadow-xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[22px]">campaign</span>
                Transmitir Recado
              </h3>
              <button
                type="button"
                onClick={() => setBroadcastModalRoom(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBroadcast} className="flex flex-col gap-3">
              <p className="text-xs text-on-surface-variant font-medium">
                Este recado ficará em destaque no topo da sala <strong>{broadcastModalRoom.name}</strong> para todos os membros.
              </p>

              <textarea
                rows={3}
                required
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="Ex: Pessoal, iniciamos agora 25 minutos de foco na leitura..."
                className="w-full p-3 bg-surface rounded-2xl border border-outline-variant text-xs font-medium focus:outline-none focus:border-primary"
              />

              <button
                type="submit"
                className="w-full py-3 bg-primary text-on-primary font-bold text-xs rounded-2xl border-b-4 border-on-primary-fixed-variant cursor-pointer"
              >
                Publicar Recado na Sala
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Set Activity Modal */}
      {activityModalRoom && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-sm border-2 border-outline-variant shadow-xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-tertiary text-[22px]">flag</span>
                Definir Atividade de Foco
              </h3>
              <button
                type="button"
                onClick={() => setActivityModalRoom(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  Título da Atividade:
                </label>
                <input
                  type="text"
                  required
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  placeholder="Ex: Resolução de Exercícios, Leitura Guiada..."
                  className="w-full p-3 bg-surface rounded-2xl border border-outline-variant text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  Instruções ou Descrição:
                </label>
                <input
                  type="text"
                  value={actDesc}
                  onChange={(e) => setActDesc(e.target.value)}
                  placeholder="Ex: Foco total individual por 25 minutos."
                  className="w-full p-3 bg-surface rounded-2xl border border-outline-variant text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  Duração da Sessão (Minutos):
                </label>
                <select
                  value={actDuration}
                  onChange={(e) => setActDuration(e.target.value)}
                  className="w-full p-3 bg-surface rounded-2xl border border-outline-variant text-xs font-semibold"
                >
                  <option value="15">15 Minutos (Curta)</option>
                  <option value="25">25 Minutos (Pomodoro Padrão)</option>
                  <option value="45">45 Minutos (Aprofundada)</option>
                  <option value="60">60 Minutos (Longa)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-on-primary font-bold text-xs rounded-2xl border-b-4 border-on-primary-fixed-variant cursor-pointer mt-1"
              >
                Atualizar Sessão de Foco
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SOS Alert Detail Modal */}
      {selectedSosRoom && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-sm border-2 border-outline-variant shadow-xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-error text-[22px]">
                  warning
                </span>
                Detalhes do Pedido de Apoio
              </h3>
              <button
                type="button"
                onClick={() => setSelectedSosRoom(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-on-surface-variant font-medium">
              Membros que acionaram o modo de autorregulação na sala{' '}
              <strong>{selectedSosRoom.name}</strong>:
            </p>

            <div className="flex flex-col gap-2">
              <div className="p-3 bg-error-container/40 rounded-2xl border border-error/30 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-on-surface">Lucas M. (Membro)</p>
                  <p className="text-[10px] text-on-surface-variant">
                    Relatou sobrecarga há 5 min • Passo 2 (Beba Água)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Canal de apoio direto aberto com Lucas M.')}
                  className="bg-primary text-on-primary px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Apoiar
                </button>
              </div>

              <div className="p-3 bg-error-container/40 rounded-2xl border border-error/30 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-on-surface">Mariana S. (Membro)</p>
                  <p className="text-[10px] text-on-surface-variant">
                    Relatou perda de foco há 12 min • Concluído
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Canal de apoio direto aberto com Mariana S.')}
                  className="bg-primary text-on-primary px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Apoiar
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSosRoom(null)}
              className="w-full py-3 bg-surface-container text-on-surface font-bold text-xs rounded-2xl mt-2 cursor-pointer"
            >
              Marcar como Resolvido
            </button>
          </div>
        </div>
      )}

      {/* Member Profile Observation Modal for Anfitrião */}
      {inspectStudent && inspectRoom && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-lg border-2 border-outline-variant shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-outline-variant/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center text-3xl shadow-sm border border-primary/20">
                  {inspectStudent.avatarEmoji || '👤'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-on-surface">
                      {inspectStudent.name}
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant">
                      {inspectStudent.role || 'Membro'}
                    </span>
                  </div>
                  <p className="text-xs text-outline font-medium flex items-center gap-1.5 mt-0.5">
                    <span>Sala: <strong>{inspectRoom.name}</strong></span>
                    <span>•</span>
                    <span>Conectado às {inspectStudent.joinedAt || '09:00'}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setInspectStudent(null);
                  setInspectRoom(null);
                }}
                className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-bold text-on-surface hover:bg-surface-container-high cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Member Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-surface rounded-2xl border border-outline-variant/60 flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Estado Atual</span>
                <span className="font-black text-xs text-on-surface flex items-center gap-1">
                  {inspectStudent.status === 'foco' && '🟢 Em Foco'}
                  {inspectStudent.status === 'pausa' && '🟡 Em Pausa'}
                  {inspectStudent.status === 'ajuda' && '🔴 Precisa Apoio'}
                  {inspectStudent.status === 'online' && '🔵 Online'}
                </span>
              </div>

              <div className="p-3 bg-surface rounded-2xl border border-outline-variant/60 flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Humor Reportado</span>
                <span className="font-black text-xs text-on-surface truncate">
                  {inspectStudent.mood || '😊 Calmo'}
                </span>
              </div>

              <div className="p-3 bg-surface rounded-2xl border border-outline-variant/60 flex flex-col gap-0.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Foco Acumulado</span>
                <span className="font-black text-xs text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">timer</span>
                  {inspectStudent.focusMinutesToday || 25} min
                </span>
              </div>
            </div>

            {/* Current Focus Task */}
            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/50 flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase text-primary tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">task_alt</span>
                Objetivo / Atividade em Execução
              </span>
              <p className="text-xs font-bold text-on-surface leading-snug">
                "{inspectStudent.currentTask || 'Participando ativamente da sessão de foco da sala'}"
              </p>
            </div>

            {/* Sensory & Neurodivergent Preferences */}
            <div className="p-4 bg-tertiary-container/20 rounded-2xl border border-tertiary/30 flex flex-col gap-1.5">
              <span className="text-xs font-black text-tertiary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                Acomodações & Preferências Sensoriais
              </span>
              <p className="text-xs font-semibold text-on-surface leading-relaxed">
                {inspectStudent.sensoryPreferences ||
                  'Prefere ambiente tranquilo, com iluminação suave, ruído de fundo moderado e interações pelo mural.'}
              </p>
            </div>

            {/* Private Host Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-[16px]">edit_note</span>
                  Anotações de Suporte (Visível apenas para o Anfitrião):
                </span>
              </label>
              <textarea
                rows={2}
                value={editedNeuroNote}
                onChange={(e) => setEditedNeuroNote(e.target.value)}
                placeholder="Ex: Apresentou excelente engajamento na última hora..."
                className="w-full p-3 bg-surface rounded-2xl border border-outline-variant text-xs font-medium focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => {
                  if (!inspectRoom || !inspectStudent) return;
                  const updatedStudents = (inspectRoom.studentsList || []).map((s) =>
                    s.id === inspectStudent.id ? { ...s, neuroNotes: editedNeuroNote } : s
                  );
                  const updatedRoom = { ...inspectRoom, studentsList: updatedStudents };
                  if (onUpdateRoom) onUpdateRoom(updatedRoom);
                  showToast('Anotação de suporte salva no perfil!');
                }}
                className="self-end px-3 py-1.5 bg-surface-container text-on-surface font-bold text-xs rounded-xl border border-outline-variant hover:bg-surface-container-high cursor-pointer"
              >
                Salvar Anotação
              </button>
            </div>

            {/* Direct Host Actions */}
            <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/40">
              <span className="text-xs font-bold text-outline">Ações Diretas do Anfitrião:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Incentivo de foco enviado para ${inspectStudent.name}! ✨ (+5 🪙)`);
                  }}
                  className="py-2.5 px-3 bg-primary text-on-primary font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:bg-primary/90"
                >
                  <span className="material-symbols-outlined text-[16px]">favorite</span>
                  <span>Enviar Elogio (+5 🪙)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showToast(`Sugestão de pausa guiada enviada para ${inspectStudent.name}!`);
                  }}
                  className="py-2.5 px-3 bg-secondary-container text-on-secondary-container font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer hover:bg-secondary-container/80"
                >
                  <span className="material-symbols-outlined text-[16px]">self_improvement</span>
                  <span>Sugerir Pausa Guiada</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Backwards compatibility alias export
export const TutorDashboard = HostDashboard;
