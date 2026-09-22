import React, { useState } from 'react';
import { GameProgress, ProfileOption, RoutineChangeNotice, RoutineTask, SupportRequest, TeaProfile } from '../types';

interface Props {
  responsibleName: string;
  profiles: ProfileOption[];
  activeProfileId: string;
  onSelectProfile: (profile: ProfileOption) => Promise<void>;
  onAddProfile: () => void;
  profile: TeaProfile;
  tasks: RoutineTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string, time: string, steps: string[], scheduledDate?: string, recurrenceDays?: number[]) => void;
  onUpdateTask: (id: string, changes: {title?: string; task_time?: string | null; steps?: string[]}) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onEditProfile: () => void;
  onOpenTeaView: () => void;
  onLogout: () => void;
  accessCode: string | null;
  gameProgress: GameProgress | null;
  supportRequests: SupportRequest[];
  routineChanges: RoutineChangeNotice[];
  onConfigureAccess: (pin: string) => Promise<void>;
  onRevokeAccess: () => Promise<void>;
  onResolveRequest: (id: string) => Promise<void>;
  onCreateRoutineChange: (title: string, description: string, effectiveAt: string) => Promise<void>;
  onInviteTutor: (email: string) => Promise<void>;
}

export const ResponsibleDashboard: React.FC<Props> = ({
  responsibleName,
  profiles, activeProfileId, onSelectProfile, onAddProfile,
  profile,
  tasks,
  onToggleTask,
  onAddTask,
  onUpdateTask, onDeleteTask,
  onEditProfile,
  onOpenTeaView,
  onLogout,
  accessCode,
  gameProgress,
  supportRequests,
  routineChanges,
  onConfigureAccess,
  onRevokeAccess,
  onResolveRequest,
  onCreateRoutineChange,
  onInviteTutor,
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0,10));
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [pin, setPin] = useState('');
  const [tutorEmail, setTutorEmail] = useState('');
  const [changeTitle, setChangeTitle] = useState('');
  const [changeDescription, setChangeDescription] = useState('');
  const [changeAt, setChangeAt] = useState('');
  const [feedback, setFeedback] = useState('');
  const [confirmDeleteTask, setConfirmDeleteTask] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const visibleTasks = tasks.filter((task) => !task.scheduledDate || task.scheduledDate === selectedDate || task.recurrenceDays?.includes(new Date(`${selectedDate}T12:00:00`).getDay()));
  const completed = visibleTasks.filter((task) => task.completed).length;

  const add = () => {
    onAddTask(title, time, stepsText.split('\n').map((item) => item.trim()), scheduledDate, recurrenceDays);
    setTitle('');
    setTime('');
    setStepsText('');
  };

  const configureAccess = async () => {
    setFeedback('');
    try { await onConfigureAccess(pin); setPin(''); setFeedback('Código e PIN do estudante atualizados.'); }
    catch (error) { setFeedback(error instanceof Error ? error.message : 'Não foi possível configurar o acesso.'); }
  };

  const invite = async () => {
    setFeedback('');
    try { await onInviteTutor(tutorEmail); setTutorEmail(''); setFeedback('Tutor adicionado à rede de apoio.'); }
    catch (error) { setFeedback(error instanceof Error ? error.message : 'Não foi possível adicionar o tutor.'); }
  };

  const announceChange = async () => {
    setFeedback('');
    try {
      await onCreateRoutineChange(changeTitle, changeDescription, changeAt);
      setChangeTitle(''); setChangeDescription(''); setChangeAt('');
      setFeedback('Mudança registrada e visível no acesso do estudante.');
    } catch (error) { setFeedback(error instanceof Error ? error.message : 'Não foi possível registrar a mudança.'); }
  };

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-5 py-7">
      <header className="flex flex-wrap gap-3 items-center justify-between mb-7">
        <div>
          <p className="text-sm text-on-surface-variant">Olá, {responsibleName}</p>
          <h1 className="text-3xl font-extrabold">Rotina de {profile.name}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={onOpenTeaView} className="rounded-2xl bg-secondary text-white font-bold px-4 py-3">Ver tela TEA</button>
          <button onClick={onLogout} className="rounded-2xl border border-outline-variant font-bold px-4 py-3">Sair</button>
        </div>
      </header>

      <section className="mb-5 rounded-3xl bg-white border border-outline-variant/60 p-4 flex flex-wrap gap-3 items-center">
        <label className="font-bold text-sm" htmlFor="active-profile">Estudante</label>
        <select id="active-profile" value={activeProfileId} onChange={(event) => { const selected = profiles.find((item) => item.id === event.target.value); if (selected) onSelectProfile(selected); }} className="flex-1 min-w-48 rounded-2xl border-2 border-outline-variant p-3">
          {profiles.map((item) => <option key={item.id} value={item.id}>{item.profile.name}</option>)}
        </select>
        <button onClick={onAddProfile} className="rounded-2xl bg-primary text-white font-extrabold px-4 py-3">Cadastrar outro estudante</button>
      </section>

      <div className="grid lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 bg-white rounded-3xl border border-outline-variant/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold">Hoje</h2>
              <p className="text-sm text-on-surface-variant">{completed} de {visibleTasks.length} tarefas concluídas</p>
            </div>
            <input aria-label="Data da rotina" type="date" value={selectedDate} onChange={(e)=>setSelectedDate(e.target.value)} className="rounded-xl border p-2" />
          </div>

          <div className="space-y-3">
            {visibleTasks.map((task) => (
              <div key={task.id} className="w-full flex items-center gap-4 text-left rounded-2xl border border-outline-variant/60 p-4 hover:bg-surface-container-low">
                <button aria-label={task.completed ? 'Reabrir tarefa' : 'Concluir tarefa'} onClick={() => onToggleTask(task.id)} className={`w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-tertiary border-tertiary text-white' : 'border-outline'}`}>{task.completed ? '✓' : ''}</button>
                <div className="flex-1">
                  <div className={`font-bold ${task.completed ? 'line-through opacity-60' : ''}`}>{task.title}</div>
                  <div className="text-xs text-on-surface-variant mt-1">{task.time} • {task.category}</div>
                </div>
                <button onClick={async() => { const nextTitle = window.prompt('Novo nome da tarefa:', task.title); if (nextTitle?.trim()) await onUpdateTask(task.id,{title:nextTitle.trim()}); }} className="rounded-xl border px-3 py-2 text-sm font-bold">Editar</button>
                <button onClick={() => setConfirmDeleteTask(task.id)} className="rounded-xl border border-error text-error px-3 py-2 text-sm font-bold">Excluir</button>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="bg-white rounded-3xl border border-outline-variant/60 p-5">
            <h2 className="font-extrabold text-lg">Perfil adaptativo</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="rounded-xl bg-surface-container-low p-3"><strong>Suporte:</strong> {profile.supportLevel}</div>
              <div className="rounded-xl bg-surface-container-low p-3"><strong>Comunicação:</strong> {profile.communicationPreference}</div>
              <div className="rounded-xl bg-surface-container-low p-3"><strong>Modo suave:</strong> {profile.softVisualMode ? 'Ativo' : 'Não necessário'}</div>
              <div className="rounded-xl bg-surface-container-low p-3"><strong>Me perdi:</strong> Ativo</div>
            </div>
            <button onClick={onEditProfile} className="w-full mt-4 rounded-2xl border-2 border-primary text-primary font-extrabold py-3">Editar adaptações</button>
          </section>
          <section className="bg-white rounded-3xl border border-outline-variant/60 p-5">
            <h2 className="font-extrabold text-lg">Acesso do estudante</h2>
            {accessCode ? <div className="mt-3 rounded-2xl bg-secondary-fixed p-4 text-center"><span className="text-xs font-bold block">CÓDIGO DO ESTUDANTE</span><strong className="text-lg tracking-widest">{accessCode}</strong></div> : <p className="text-sm text-on-surface-variant mt-2">Crie um PIN de segurança para liberar o acesso individual.</p>}
            <input aria-label="Novo PIN de segurança" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="PIN de segurança — 6 números" inputMode="numeric" className="w-full mt-3 rounded-2xl border-2 border-outline-variant p-3" />
            <button onClick={configureAccess} disabled={pin.length !== 6} className="w-full mt-2 rounded-2xl bg-secondary text-white font-extrabold py-3 disabled:opacity-50">{accessCode ? 'Trocar PIN' : 'Criar acesso'}</button>
            {accessCode && <button onClick={() => setConfirmRevoke(true)} className="w-full mt-2 rounded-2xl border border-error text-error font-bold py-3">Revogar acesso</button>}
          </section>
          <section className="bg-white rounded-3xl border border-outline-variant/60 p-5"><h2 className="font-extrabold text-lg">Conquistas</h2><p className="text-3xl font-extrabold mt-3">⭐ {gameProgress?.stars || 0}</p><p className="text-sm opacity-70 mt-1">Mascote: {gameProgress?.mascot || 'coruja'}</p></section>
        </aside>
      </div>

      {feedback && <div className="mt-5 rounded-2xl bg-primary-fixed text-on-primary-fixed p-4 font-bold">{feedback}</div>}

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <section className="bg-white rounded-3xl border border-outline-variant/60 p-5">
          <h2 className="text-xl font-extrabold">Pedidos de apoio</h2>
          <div className="mt-4 space-y-3">{supportRequests.filter((item) => item.status !== 'resolvido').length ? supportRequests.filter((item) => item.status !== 'resolvido').map((item) => (
            <div key={item.id} className="rounded-2xl bg-secondary-fixed p-4"><strong>{item.kind.replace('-', ' ')}</strong><p className="text-sm mt-1">{item.message}</p><button onClick={() => onResolveRequest(item.id)} className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-bold">Marcar como resolvido</button></div>
          )) : <p className="text-sm text-on-surface-variant">Nenhum pedido pendente.</p>}</div>
        </section>
        <section className="bg-white rounded-3xl border border-outline-variant/60 p-5">
          <h2 className="text-xl font-extrabold">Rede de apoio</h2>
          <p className="text-sm text-on-surface-variant mt-1">Autorize um tutor ou profissional pelo e-mail da conta dele.</p>
          <input value={tutorEmail} onChange={(e) => setTutorEmail(e.target.value)} type="email" placeholder="email@exemplo.com" className="w-full mt-4 rounded-2xl border-2 border-outline-variant p-4" />
          <button onClick={invite} className="mt-2 rounded-2xl bg-tertiary text-white font-extrabold px-5 py-3">Adicionar tutor</button>
        </section>
      </div>

      <section className="mt-5 bg-white rounded-3xl border border-outline-variant/60 p-5">
        <h2 className="text-xl font-extrabold">Avisar mudança na rotina</h2>
        <p className="text-sm text-on-surface-variant mt-1">O aviso antecipado aumenta a previsibilidade e aparecerá no perfil do estudante.</p>
        <div className="grid md:grid-cols-2 gap-3 mt-4"><input value={changeTitle} onChange={(e) => setChangeTitle(e.target.value)} placeholder="Ex.: Consulta mudou de horário" className="rounded-2xl border-2 border-outline-variant p-4" /><input value={changeAt} onChange={(e) => setChangeAt(e.target.value)} type="datetime-local" className="rounded-2xl border-2 border-outline-variant p-4" /></div>
        <textarea value={changeDescription} onChange={(e) => setChangeDescription(e.target.value)} placeholder="Explique o que mudou e o que acontecerá agora" className="w-full min-h-24 rounded-2xl border-2 border-outline-variant p-4 mt-3" />
        <button onClick={announceChange} disabled={!changeTitle.trim() || !changeAt} className="mt-3 rounded-2xl bg-primary text-white font-extrabold px-6 py-3.5 disabled:opacity-50">Publicar aviso</button>
        {routineChanges.length > 0 && <p className="text-xs text-on-surface-variant mt-3">{routineChanges.length} aviso(s) registrado(s).</p>}
      </section>

      {confirmDeleteTask && <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-5"><div className="bg-white rounded-3xl p-6 max-w-sm w-full"><h2 className="text-xl font-extrabold">Excluir tarefa?</h2><p className="text-sm mt-2 opacity-70">Ela será arquivada e não aparecerá mais na rotina.</p><div className="flex gap-2 mt-5"><button onClick={() => setConfirmDeleteTask(null)} className="flex-1 rounded-2xl border py-3 font-bold">Cancelar</button><button onClick={async()=>{await onDeleteTask(confirmDeleteTask);setConfirmDeleteTask(null);}} className="flex-1 rounded-2xl bg-error text-white py-3 font-bold">Excluir</button></div></div></div>}
      {confirmRevoke && <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-5"><div className="bg-white rounded-3xl p-6 max-w-sm w-full"><h2 className="text-xl font-extrabold">Revogar acesso?</h2><p className="text-sm mt-2 opacity-70">O código e as sessões atuais deixarão de funcionar. Um novo acesso poderá ser criado depois.</p><div className="flex gap-2 mt-5"><button onClick={() => setConfirmRevoke(false)} className="flex-1 rounded-2xl border py-3 font-bold">Cancelar</button><button onClick={async()=>{await onRevokeAccess();setConfirmRevoke(false);}} className="flex-1 rounded-2xl bg-error text-white py-3 font-bold">Revogar</button></div></div></div>}

      <section className="mt-5 bg-white rounded-3xl border border-outline-variant/60 p-5">
        <h2 className="text-xl font-extrabold">Criar nova tarefa</h2>
        <p className="text-sm text-on-surface-variant mt-1">As etapas serão mostradas para {profile.name} quando o passo a passo estiver ativo.</p>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome da tarefa" className="rounded-2xl border-2 border-outline-variant p-4" />
          <input value={time} onChange={(e) => setTime(e.target.value)} type="time" className="rounded-2xl border-2 border-outline-variant p-4" />
          <input aria-label="Data da tarefa" value={scheduledDate} onChange={(e)=>setScheduledDate(e.target.value)} type="date" className="rounded-2xl border-2 border-outline-variant p-4" />
        </div>
        <fieldset className="mt-3"><legend className="text-sm font-bold">Repetir semanalmente (opcional)</legend><div className="flex flex-wrap gap-2 mt-2">{['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((day,index)=><label key={day} className="rounded-xl border px-3 py-2 text-sm"><input type="checkbox" checked={recurrenceDays.includes(index)} onChange={()=>setRecurrenceDays((days)=>days.includes(index)?days.filter((item)=>item!==index):[...days,index])} /> {day}</label>)}</div></fieldset>
        <textarea value={stepsText} onChange={(e) => setStepsText(e.target.value)} placeholder={'Etapas, uma por linha\nEx.: Pegue a escova\nColoque a pasta'} className="w-full min-h-28 rounded-2xl border-2 border-outline-variant p-4 mt-3" />
        <button onClick={add} className="mt-3 rounded-2xl bg-primary text-white font-extrabold px-6 py-3.5">Adicionar tarefa</button>
      </section>
    </main>
  );
};
