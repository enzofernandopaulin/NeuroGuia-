import React, { useState } from 'react';
import { RoutineTask, TeaProfile } from '../types';
import { StudentAccessSettings } from './StudentAccessSettings';

interface Props {
  responsibleName: string;
  profile: TeaProfile;
  profileId: string;
  tasks: RoutineTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string, time: string, steps: string[]) => void;
  onEditProfile: () => void;
  onOpenTeaView: () => void;
  onLogout: () => void;
}

export const ResponsibleDashboard: React.FC<Props> = ({
  responsibleName,
  profile,
  profileId,
  tasks,
  onToggleTask,
  onAddTask,
  onEditProfile,
  onOpenTeaView,
  onLogout,
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [stepsText, setStepsText] = useState('');

  const completed = tasks.filter((task) => task.completed).length;

  const add = () => {
    onAddTask(title, time, stepsText.split('\n').map((item) => item.trim()));
    setTitle('');
    setTime('');
    setStepsText('');
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
        </aside>
      </div>

      <StudentAccessSettings profileId={profileId} profileName={profile.name} />

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
