import React, { useState } from 'react';
import { RoutineChangeNotice, RoutineTask, SupportRequest, TeaProfile } from '../types';

interface Props {
  responsibleName: string;
  profile: TeaProfile;
  tasks: RoutineTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string, time: string, steps: string[]) => void;
  onEditProfile: () => void;
  onOpenTeaView: () => void;
  onLogout: () => void;
  accessCode: string | null;
  supportRequests: SupportRequest[];
  routineChanges: RoutineChangeNotice[];
  onConfigureAccess: (pin: string) => Promise<void>;
  onResolveRequest: (id: string) => Promise<void>;
  onCreateRoutineChange: (title: string, description: string, effectiveAt: string) => Promise<void>;
  onInviteTutor: (email: string) => Promise<void>;
}

export const ResponsibleDashboard: React.FC<Props> = ({
  responsibleName,
  profile,
  tasks,
  onToggleTask,
  onAddTask,
  onEditProfile,
  onOpenTeaView,
  onLogout,
  accessCode,
  supportRequests,
  routineChanges,
  onConfigureAccess,
  onResolveRequest,
  onCreateRoutineChange,
  onInviteTutor,
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [pin, setPin] = useState('');
  const [tutorEmail, setTutorEmail] = useState('');
  const [changeTitle, setChangeTitle] = useState('');
  const [changeDescription, setChangeDescription] = useState('');
  const [changeAt, setChangeAt] = useState('');
  const [feedback, setFeedback] = useState('');

  const completed = tasks.filter((task) => task.completed).length;

  const add = () => {
    onAddTask(title, time, stepsText.split('\n').map((item) => item.trim()));
    setTitle('');
    setTime('');
    setStepsText('');
  };

  const configureAccess = async () => {
    setFeedback('');
    try { await onConfigureAccess(pin); setPin(''); setFeedback('Código e PIN da sala atualizados.'); }
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
      setFeedback('Mudança registrada e visível na Sala do TEA.');
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

      <div className="grid lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 bg-white rounded-3xl border border-outline-variant/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold">Hoje</h2>
              <p className="text-sm text-on-surface-variant">{completed} de {tasks.length} tarefas concluídas</p>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <button key={task.id} onClick={() => onToggleTask(task.id)} className="w-full flex items-center gap-4 text-left rounded-2xl border border-outline-variant/60 p-4 hover:bg-surface-container-low">
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-tertiary border-tertiary text-white' : 'border-outline'}`}>{task.completed ? '✓' : ''}</div>
                <div className="flex-1">
                  <div className={`font-bold ${task.completed ? 'line-through opacity-60' : ''}`}>{task.title}</div>
                  <div className="text-xs text-on-surface-variant mt-1">{task.time} • {task.category}</div>
                </div>
              </button>
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
            <h2 className="font-extrabold text-lg">Acesso à Sala do TEA</h2>
            {accessCode ? <div className="mt-3 rounded-2xl bg-secondary-fixed p-4 text-center"><span className="text-xs font-bold block">CÓDIGO</span><strong className="text-lg tracking-widest">{accessCode}</strong></div> : <p className="text-sm text-on-surface-variant mt-2">Crie um PIN para liberar o código da sala.</p>}
            <input aria-label="Novo PIN da sala" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="PIN de 6 números" inputMode="numeric" className="w-full mt-3 rounded-2xl border-2 border-outline-variant p-3" />
            <button onClick={configureAccess} disabled={pin.length !== 6} className="w-full mt-2 rounded-2xl bg-secondary text-white font-extrabold py-3 disabled:opacity-50">{accessCode ? 'Trocar PIN' : 'Criar acesso'}</button>
          </section>
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
        <p className="text-sm text-on-surface-variant mt-1">O aviso antecipado aumenta a previsibilidade e aparecerá na sala.</p>
        <div className="grid md:grid-cols-2 gap-3 mt-4"><input value={changeTitle} onChange={(e) => setChangeTitle(e.target.value)} placeholder="Ex.: Consulta mudou de horário" className="rounded-2xl border-2 border-outline-variant p-4" /><input value={changeAt} onChange={(e) => setChangeAt(e.target.value)} type="datetime-local" className="rounded-2xl border-2 border-outline-variant p-4" /></div>
        <textarea value={changeDescription} onChange={(e) => setChangeDescription(e.target.value)} placeholder="Explique o que mudou e o que acontecerá agora" className="w-full min-h-24 rounded-2xl border-2 border-outline-variant p-4 mt-3" />
        <button onClick={announceChange} disabled={!changeTitle.trim() || !changeAt} className="mt-3 rounded-2xl bg-primary text-white font-extrabold px-6 py-3.5 disabled:opacity-50">Publicar aviso</button>
        {routineChanges.length > 0 && <p className="text-xs text-on-surface-variant mt-3">{routineChanges.length} aviso(s) registrado(s).</p>}
      </section>

      <section className="mt-5 bg-white rounded-3xl border border-outline-variant/60 p-5">
        <h2 className="text-xl font-extrabold">Criar nova tarefa</h2>
        <p className="text-sm text-on-surface-variant mt-1">As etapas serão mostradas para {profile.name} quando o passo a passo estiver ativo.</p>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome da tarefa" className="rounded-2xl border-2 border-outline-variant p-4" />
          <input value={time} onChange={(e) => setTime(e.target.value)} type="time" className="rounded-2xl border-2 border-outline-variant p-4" />
        </div>
        <textarea value={stepsText} onChange={(e) => setStepsText(e.target.value)} placeholder={'Etapas, uma por linha\nEx.: Pegue a escova\nColoque a pasta'} className="w-full min-h-28 rounded-2xl border-2 border-outline-variant p-4 mt-3" />
        <button onClick={add} className="mt-3 rounded-2xl bg-primary text-white font-extrabold px-6 py-3.5">Adicionar tarefa</button>
      </section>
    </main>
  );
};
