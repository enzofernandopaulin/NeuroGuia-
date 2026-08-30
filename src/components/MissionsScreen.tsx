import React, { useState } from 'react';
import { Mission, Classroom, UserRole } from '../types';

interface MissionsScreenProps {
  missions: Mission[];
  onUpdateMission: (id: string) => void;
  onAddCoins?: (amount: number) => void;
  classrooms?: Classroom[];
  role?: UserRole;
  onUpdateRoom?: (updatedRoom: Classroom) => void;
  onSendRoomMissions?: (roomId: string, newMissions: Mission[]) => void;
  onDeleteMission?: (id: string) => void;
  onEditMission?: (updatedMission: Mission) => void;
}

export const MissionsScreen: React.FC<MissionsScreenProps> = ({
  missions,
  onUpdateMission,
  onAddCoins,
  classrooms = [],
  role = 'student',
  onUpdateRoom,
  onSendRoomMissions,
  onDeleteMission,
  onEditMission,
}) => {
  const isTutor = role === 'tutor';
  const [userXp, setUserXp] = useState(125);
  const [level, setLevel] = useState(12);
  const maxXp = 500;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Host Mission Management State inside Aba Missões
  const [showHostPanel, setShowHostPanel] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(classrooms[0]?.id || '');
  
  // Quick Mission Form State
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionTarget, setNewMissionTarget] = useState('Todos');
  const [newMissionXp, setNewMissionXp] = useState('35');

  // Edit Mission Inline State
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingTarget, setEditingTarget] = useState('Todos');
  const [editingXp, setEditingXp] = useState(35);

  // Host Checklists Drafts State
  const [checklistTab, setChecklistTab] = useState<'coletiva' | 'individual'>('coletiva');
  const [newCollectiveText, setNewCollectiveText] = useState('');
  const [newIndividualText, setNewIndividualText] = useState('');
  const [selectedMemberName, setSelectedMemberName] = useState<string>('Alex');

  const [collectiveList, setCollectiveList] = useState<Array<{ id: string; title: string; completed: boolean }>>([
    { id: 'col_1', title: '09:00 - Leitura e Foco Silencioso Inicial (15 min)', completed: false },
    { id: 'col_2', title: '10:30 - Revisão de Bloco de Questões em Grupo', completed: false },
  ]);

  const [memberLists, setMemberLists] = useState<Record<string, Array<{ id: string; title: string; completed: boolean }>>>({
    Alex: [{ id: 'ind_1', title: 'Resolver 10 exercícios de Matemática Aplicada', completed: false }],
    Beatriz: [{ id: 'ind_2', title: 'Redação: Estruturar introdução e desenvolvimento', completed: false }],
  });

  const selectedRoom = classrooms.find((c) => c.id === selectedRoomId) || classrooms[0];

  const handleClaim = (mission: Mission) => {
    if (mission.completed) return;
    onUpdateMission(mission.id);
    if (onAddCoins) {
      onAddCoins(mission.xp);
    }
    setUserXp((prev) => {
      const next = prev + mission.xp;
      if (next >= maxXp) {
        setLevel((l) => l + 1);
        return next - maxXp;
      }
      return next;
    });
  };

  // Dispatch Checklists to Room as Daily Missions
  const handleDispatchChecklist = () => {
    if (!selectedRoom) return;

    const collectiveMissions: Mission[] = collectiveList.map((item, idx) => ({
      id: `m_col_${Date.now()}_${idx}`,
      title: item.title,
      xp: 35,
      current: 0,
      target: 1,
      completed: false,
      icon: 'assignment_turned_in',
      type: 'daily',
      description: `Missão Coletiva enviada pelo Anfitrião para ${selectedRoom.name}`,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      assignedByHost: true,
    }));

    const individualMissions: Mission[] = Object.entries(memberLists).flatMap(([memberName, items]) =>
      (items as Array<{ id: string; title: string; completed: boolean }>).map((item, idx) => ({
        id: `m_ind_${Date.now()}_${memberName.replace(/\s+/g, '_')}_${idx}`,
        title: item.title,
        xp: 40,
        current: 0,
        target: 1,
        completed: false,
        icon: 'person_pin',
        type: 'daily',
        description: `Missão Individual para ${memberName} na sala ${selectedRoom.name}`,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        targetMember: memberName,
        assignedByHost: true,
      }))
    );

    const allNew = [...collectiveMissions, ...individualMissions];

    if (onSendRoomMissions) {
      onSendRoomMissions(selectedRoom.id, allNew);
    }

    if (onUpdateRoom) {
      const existingMissions = selectedRoom.dailyMissions || [];
      onUpdateRoom({
        ...selectedRoom,
        dailyMissions: [...allNew, ...existingMissions],
      });
    }

    showToast(`✨ Checklists enviadas como missões diárias para ${selectedRoom.name}!`);
  };

  // Direct Send Single Mission
  const handleSendSingleMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMissionTitle.trim() || !selectedRoom) return;

    const mission: Mission = {
      id: `m_host_${Date.now()}`,
      title: newMissionTitle.trim(),
      xp: Number(newMissionXp) || 35,
      current: 0,
      target: 1,
      completed: false,
      icon: 'verified_user',
      type: 'daily',
      description: `Missão enviada pelo Anfitrião da sala ${selectedRoom.name}`,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      targetMember: newMissionTarget === 'Todos' ? undefined : newMissionTarget,
      assignedByHost: true,
    };

    if (onSendRoomMissions) {
      onSendRoomMissions(selectedRoom.id, [mission]);
    }

    if (onUpdateRoom) {
      const existingMissions = selectedRoom.dailyMissions || [];
      onUpdateRoom({
        ...selectedRoom,
        dailyMissions: [mission, ...existingMissions],
      });
    }

    setNewMissionTitle('');
    showToast(`✨ Missão "${mission.title}" enviada com sucesso!`);
  };

  // Delete Mission
  const handleDelete = (missionId: string) => {
    if (onDeleteMission) {
      onDeleteMission(missionId);
    }
    if (selectedRoom && onUpdateRoom) {
      const updatedRoomMissions = (selectedRoom.dailyMissions || []).filter((m) => m.id !== missionId);
      onUpdateRoom({
        ...selectedRoom,
        dailyMissions: updatedRoomMissions,
      });
    }
    showToast('🗑️ Missão excluída com sucesso.');
  };

  // Save Edit Mission
  const handleSaveEdit = (missionId: string) => {
    if (!editingTitle.trim()) return;

    const updated: Mission = {
      id: missionId,
      title: editingTitle.trim(),
      xp: editingXp,
      current: 0,
      target: 1,
      completed: false,
      icon: 'verified_user',
      type: 'daily',
      description: `Missão enviada/alterada pelo Anfitrião`,
      roomId: selectedRoom?.id,
      roomName: selectedRoom?.name,
      targetMember: editingTarget === 'Todos' ? undefined : editingTarget,
      assignedByHost: true,
    };

    if (onEditMission) {
      onEditMission(updated);
    }

    if (selectedRoom && onUpdateRoom) {
      const updatedRoomMissions = (selectedRoom.dailyMissions || []).map((m) =>
        m.id === missionId ? updated : m
      );
      onUpdateRoom({
        ...selectedRoom,
        dailyMissions: updatedRoomMissions,
      });
    }

    setEditingMissionId(null);
    showToast('✏️ Missão alterada com sucesso!');
  };

  const dailyMissions = missions.filter((m) => m.type === 'daily');
  const seasonMissions = missions.filter((m) => m.type === 'season');

  return (
    <div className="pt-20 pb-28 px-4 max-w-2xl mx-auto flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-on-surface text-surface px-4 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 border border-outline/20 animate-bounce">
          <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Stats Row */}
      <div className="flex items-stretch justify-between gap-3">
        {/* Streak Card */}
        <div className="flex-1 flex flex-col items-center justify-center bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_0_var(--color-surface-variant)] border border-outline-variant/40">
          <div className="flex items-center gap-1 text-error mb-1">
            <span
              className="material-symbols-outlined text-[32px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span className="text-3xl font-black text-error">5</span>
          </div>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Dias
          </span>
        </div>

        {/* Level Progress Card */}
        <div className="flex-[2] flex flex-col justify-center bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_0_var(--color-surface-variant)] border border-outline-variant/40">
          <div className="flex justify-between items-end mb-2">
            <span className="font-bold text-lg text-on-surface">Nível {level}</span>
            <span className="font-bold text-xs text-primary">{userXp} / {maxXp} XP</span>
          </div>
          <div className="w-full h-4 rounded-full bg-surface-variant overflow-hidden shadow-inner">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 relative"
              style={{ width: `${(userXp / maxXp) * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
            </div>
          </div>
          <span className="text-xs text-on-surface-variant mt-2 leading-tight">
            Quase lá! Faltam {maxXp - userXp} XP para o próximo nível.
          </span>
        </div>
      </div>

      {/* Concept Explanation Banner: Atividades vs Missões */}
      <section className="bg-surface-container-lowest border-2 border-outline-variant/80 rounded-3xl p-4 shadow-xs flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500 text-[22px]">lightbulb</span>
          <h3 className="font-extrabold text-xs sm:text-sm text-on-surface uppercase tracking-wide">
            Entenda a diferença: Atividades vs. Missões
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-primary-container/20 border border-primary/20 p-3 rounded-2xl flex flex-col gap-1">
            <span className="font-extrabold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              <span>📚 Atividades Acadêmicas</span>
            </span>
            <p className="text-on-surface-variant leading-relaxed text-[11px]">
              São os conteúdos de estudo, trabalhos, leituras, pesquisas e exercícios práticos da sua rotina ou sala de aula.
            </p>
          </div>
          <div className="bg-secondary-container/20 border border-secondary/20 p-3 rounded-2xl flex flex-col gap-1">
            <span className="font-extrabold text-secondary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">stars</span>
              <span>🎯 Missões Gamificadas</span>
            </span>
            <p className="text-on-surface-variant leading-relaxed text-[11px]">
              São desafios de engajamento e conquistas que concedem <strong>XP e Moedas</strong> para evoluir e alimentar seu Mascote!
            </p>
          </div>
        </div>
      </section>

      {/* HOST MANAGEMENT PANEL IN MISSIONS TAB - ONLY FOR ANFITRIÃO / TUTOR */}
      {isTutor && (
        <section className="bg-surface-container-lowest border-2 border-primary/30 rounded-3xl p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-outline-variant/50 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
              <div>
                <h2 className="font-black text-base sm:text-lg text-on-surface flex items-center gap-2">
                  <span>Gestão de Missões do Anfitrião</span>
                  <span className="bg-primary-container text-primary text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                    Enviar • Alterar • Excluir
                  </span>
                </h2>
                <p className="text-xs text-outline font-medium">
                  Crie, edite e envie missões diárias para os membros das suas salas.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHostPanel(!showHostPanel)}
              className="p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface cursor-pointer text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showHostPanel ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>

          {showHostPanel && (
            <div className="flex flex-col gap-4">
              {/* Room Selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-primary-container/20 p-3.5 rounded-2xl border border-primary/20">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="material-symbols-outlined text-primary text-[20px]">meeting_room</span>
                  <span className="text-xs font-extrabold text-on-surface">Selecione a Sala Alvo:</span>
                </div>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1.5 bg-surface text-on-surface font-bold text-xs rounded-xl border border-outline-variant focus:outline-none focus:border-primary cursor-pointer"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Send Form */}
              <form onSubmit={handleSendSingleMission} className="flex flex-col gap-2.5 bg-surface-container/40 p-4 rounded-2xl border border-outline-variant/60">
                <span className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">add_task</span>
                  <span>Enviar Nova Missão Diária</span>
                </span>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newMissionTitle}
                    onChange={(e) => setNewMissionTitle(e.target.value)}
                    placeholder="Ex: Resolver 15 questões de raciocínio lógico..."
                    className="flex-1 px-3.5 py-2 bg-surface rounded-xl border border-outline-variant text-xs font-medium text-on-surface focus:outline-none focus:border-primary"
                  />

                  <select
                    value={newMissionTarget}
                    onChange={(e) => setNewMissionTarget(e.target.value)}
                    className="px-3 py-2 bg-surface rounded-xl border border-outline-variant text-xs font-bold text-on-surface focus:outline-none cursor-pointer"
                  >
                    <option value="Todos">👥 Toda a Sala</option>
                    {(selectedRoom?.studentsList || []).map((s) => (
                      <option key={s.id} value={s.name}>
                        👤 Para: {s.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={newMissionXp}
                    onChange={(e) => setNewMissionXp(e.target.value)}
                    className="px-3 py-2 bg-surface rounded-xl border border-outline-variant text-xs font-bold text-on-surface focus:outline-none cursor-pointer"
                  >
                    <option value="25">+25 XP</option>
                    <option value="35">+35 XP</option>
                    <option value="50">+50 XP</option>
                    <option value="100">+100 XP</option>
                  </select>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-on-primary font-black text-xs rounded-xl hover:bg-primary/90 cursor-pointer shadow-xs flex items-center justify-center gap-1 shrink-0 border-b-2 border-on-primary-fixed-variant active:translate-y-0.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>Enviar Missão</span>
                  </button>
                </div>
              </form>

              {/* Draft Checklists (Coletiva & Individual) */}
              <div className="flex flex-col gap-3 bg-surface-container/30 p-4 rounded-2xl border border-outline-variant/60">
                <div className="flex items-center justify-between gap-2 border-b border-outline-variant/40 pb-2">
                  <span className="text-xs font-black text-secondary uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">fact_check</span>
                    <span>Checklists de Metas do Anfitrião</span>
                  </span>

                  <div className="flex p-0.5 bg-surface-container rounded-xl border border-outline-variant/60">
                    <button
                      type="button"
                      onClick={() => setChecklistTab('coletiva')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                        checklistTab === 'coletiva'
                          ? 'bg-secondary text-on-secondary shadow-xs'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      Coletiva
                    </button>
                    <button
                      type="button"
                      onClick={() => setChecklistTab('individual')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                        checklistTab === 'individual'
                          ? 'bg-secondary text-on-secondary shadow-xs'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      Individual
                    </button>
                  </div>
                </div>

                {checklistTab === 'coletiva' ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCollectiveText}
                        onChange={(e) => setNewCollectiveText(e.target.value)}
                        placeholder="Adicionar tarefa coletiva para todos..."
                        className="flex-1 px-3 py-1.5 bg-surface rounded-xl border border-outline-variant text-xs font-medium focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newCollectiveText.trim()) return;
                          setCollectiveList((prev) => [
                            ...prev,
                            { id: `col_${Date.now()}`, title: newCollectiveText.trim(), completed: false },
                          ]);
                          setNewCollectiveText('');
                        }}
                        className="px-3 py-1.5 bg-secondary text-on-secondary font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Adicionar
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                      {collectiveList.map((item) => (
                        <div key={item.id} className="p-2 bg-surface rounded-xl border border-outline-variant/60 flex items-center justify-between text-xs font-semibold">
                          <span>{item.title}</span>
                          <button
                            type="button"
                            onClick={() => setCollectiveList((prev) => prev.filter((i) => i.id !== item.id))}
                            className="text-outline hover:text-error cursor-pointer p-0.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-on-surface">Membro:</span>
                      <select
                        value={selectedMemberName}
                        onChange={(e) => setSelectedMemberName(e.target.value)}
                        className="px-2.5 py-1 bg-surface rounded-lg border border-outline-variant text-xs font-bold text-on-surface cursor-pointer"
                      >
                        <option value="Alex">Alex</option>
                        <option value="Beatriz">Beatriz</option>
                        <option value="Carlos">Carlos</option>
                        {(selectedRoom?.studentsList || []).map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newIndividualText}
                        onChange={(e) => setNewIndividualText(e.target.value)}
                        placeholder={`Adicionar meta individual para ${selectedMemberName}...`}
                        className="flex-1 px-3 py-1.5 bg-surface rounded-xl border border-outline-variant text-xs font-medium focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newIndividualText.trim()) return;
                          const current = memberLists[selectedMemberName] || [];
                          setMemberLists((prev) => ({
                            ...prev,
                            [selectedMemberName]: [
                              ...current,
                              { id: `ind_${Date.now()}`, title: newIndividualText.trim(), completed: false },
                            ],
                          }));
                          setNewIndividualText('');
                        }}
                        className="px-3 py-1.5 bg-secondary text-on-secondary font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Adicionar
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                      {(memberLists[selectedMemberName] || []).map((item) => (
                        <div key={item.id} className="p-2 bg-surface rounded-xl border border-outline-variant/60 flex items-center justify-between text-xs font-semibold">
                          <span>{item.title}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (memberLists[selectedMemberName] || []).filter((i) => i.id !== item.id);
                              setMemberLists((prev) => ({ ...prev, [selectedMemberName]: updated }));
                            }}
                            className="text-outline hover:text-error cursor-pointer p-0.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDispatchChecklist}
                  className="w-full mt-1 px-4 py-2 bg-secondary text-on-secondary font-extrabold text-xs rounded-xl hover:bg-secondary/90 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">send_time_extension</span>
                  <span>Disparar Checklists como Missões Diárias para a Sala</span>
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Daily Missions Feed & Management */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl text-on-surface flex items-center gap-2">
            <span>Missões Diárias</span>
            <span className="text-xs font-bold bg-secondary-container text-secondary px-2.5 py-0.5 rounded-full">
              {dailyMissions.length}
            </span>
          </h2>
          <span className="text-xs font-bold text-outline">
            {isTutor
              ? 'Anfitrião pode Alterar ou Excluir abaixo'
              : 'Conclua as missões enviadas pelo Anfitrião para ganhar XP e Moedas!'}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {dailyMissions.length === 0 ? (
            <p className="text-xs text-outline italic text-center py-6 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant">
              {isTutor
                ? 'Nenhuma missão diária disponível no momento. Use o painel acima para criar e enviar missões!'
                : 'Nenhuma missão diária enviada no momento. Aguarde seu anfitrião enviar novas missões.'}
            </p>
          ) : (
            dailyMissions.map((m) => (
              <div
                key={m.id}
                className={`w-full rounded-2xl p-4 flex flex-col gap-3 transition-all border-b-4 ${
                  m.completed
                    ? 'bg-tertiary-fixed/60 border-tertiary-fixed-dim text-on-tertiary-fixed'
                    : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {/* Inline Editing Form if active */}
                {editingMissionId === m.id ? (
                  <div className="flex flex-col gap-2 p-3 bg-surface rounded-xl border border-primary">
                    <span className="text-xs font-bold text-primary">Alterar Missão</span>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="px-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant text-xs font-bold text-on-surface focus:outline-none"
                      placeholder="Título da missão..."
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={editingTarget}
                        onChange={(e) => setEditingTarget(e.target.value)}
                        className="px-2.5 py-1 bg-surface-container rounded-lg border border-outline-variant text-xs font-bold text-on-surface cursor-pointer"
                      >
                        <option value="Todos">👥 Toda a Sala</option>
                        {(selectedRoom?.studentsList || []).map((s) => (
                          <option key={s.id} value={s.name}>
                            👤 {s.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        value={editingXp}
                        onChange={(e) => setEditingXp(Number(e.target.value))}
                        className="w-20 px-2.5 py-1 bg-surface-container rounded-lg border border-outline-variant text-xs font-bold text-on-surface"
                      />

                      <button
                        type="button"
                        onClick={() => handleSaveEdit(m.id)}
                        className="px-3 py-1 bg-primary text-on-primary font-bold text-xs rounded-lg cursor-pointer"
                      >
                        Salvar Alteração
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingMissionId(null)}
                        className="px-3 py-1 bg-surface-container-high text-on-surface-variant font-bold text-xs rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal View */
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleClaim(m)}
                      className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
                        m.completed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-secondary-fixed text-on-secondary-fixed hover:bg-primary/20'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[26px]"
                        style={{ fontVariationSettings: m.completed ? "'FILL' 1" : undefined }}
                      >
                        {m.completed ? 'check_circle' : m.icon || 'star'}
                      </span>
                    </button>

                    <div className="flex-1 flex flex-col gap-1">
                      <span className={`font-bold text-sm sm:text-base ${m.completed ? 'line-through opacity-70' : ''}`}>
                        {m.title}
                      </span>

                      {m.assignedByHost && (
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
                          <span className="bg-primary-container/60 text-primary px-2 py-0.5 rounded-md border border-primary/20 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">verified_user</span>
                            <span>Enviada pelo Anfitrião {m.roomName ? `(${m.roomName})` : ''}</span>
                          </span>
                          {m.targetMember && (
                            <span className="bg-secondary-container/60 text-secondary px-2 py-0.5 rounded-md border border-secondary/20">
                              👤 Para: {m.targetMember}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 rounded-full bg-surface-variant overflow-hidden">
                          <div
                            className={`h-full rounded-full ${m.completed ? 'bg-emerald-600' : 'bg-primary'}`}
                            style={{ width: `${(m.current / m.target) * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-extrabold text-outline">
                          +{m.xp} XP
                        </span>
                      </div>
                    </div>

                    {/* Actions for Host: Alterar and Excluir - ONLY FOR ANFITRIÃO / TUTOR */}
                    {isTutor && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMissionId(m.id);
                            setEditingTitle(m.title);
                            setEditingXp(m.xp);
                            setEditingTarget(m.targetMember || 'Todos');
                          }}
                          className="px-2.5 py-1.5 bg-surface-container hover:bg-primary-container/60 text-primary font-black text-xs rounded-xl border border-outline-variant/60 cursor-pointer flex items-center gap-1 transition-colors"
                          title="Alterar missão"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                          <span className="hidden sm:inline">Alterar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(m.id)}
                          className="px-2.5 py-1.5 bg-surface-container hover:bg-error-container/60 text-error font-black text-xs rounded-xl border border-outline-variant/60 cursor-pointer flex items-center gap-1 transition-colors"
                          title="Excluir missão"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                          <span className="hidden sm:inline">Excluir</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Season Missions */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-xl text-on-surface">Missões da Temporada</h2>
        {seasonMissions.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => handleClaim(m)}
            className="w-full text-left bg-surface-container-lowest rounded-3xl p-5 border-b-4 border-outline-variant flex flex-col gap-4 relative overflow-hidden transition-all active:translate-y-0.5 cursor-pointer hover:border-primary"
          >
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-error-container/40 rounded-full pointer-events-none"></div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-14 h-14 shrink-0 bg-error-container rounded-xl flex items-center justify-center shadow-inner">
                <span
                  className="material-symbols-outlined text-[28px] text-on-error-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {m.icon}
                </span>
              </div>
              <div className="flex-1">
                <span className="font-bold text-base text-on-surface block leading-snug">
                  {m.title}
                </span>
                <span className="text-xs text-on-surface-variant mt-1 block">
                  {m.description}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 relative z-10 w-full">
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-on-surface-variant">Progresso</span>
                  <span className="text-error">
                    {m.current} / {m.target}h
                  </span>
                </div>
                <div className="w-full h-3.5 rounded-full bg-surface-variant overflow-hidden">
                  <div
                    className="h-full bg-error rounded-full transition-all duration-300"
                    style={{ width: `${(m.current / m.target) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="shrink-0 bg-surface-container-high px-3 py-2 rounded-xl flex flex-col items-center border border-outline-variant/40">
                <span
                  className="material-symbols-outlined text-[18px] text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="font-bold text-xs text-on-surface mt-0.5">+{m.xp} XP</span>
              </div>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
};
