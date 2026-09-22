import React from 'react';
import { RoutineTask, SupportRequest, TutorAssignment } from '../types';

interface Props {
  name: string;
  assignments: TutorAssignment[];
  tasks: RoutineTask[];
  requests: SupportRequest[];
  onLogout: () => void;
}

export const TutorDashboard: React.FC<Props> = ({ name, assignments, tasks, requests, onLogout }) => {
  const assignment = assignments[0];
  return (
    <main className="min-h-screen max-w-5xl mx-auto px-5 py-7">
      <header className="flex items-center justify-between gap-4 mb-7">
        <div><p className="text-sm text-on-surface-variant">Tutor ou profissional</p><h1 className="text-3xl font-extrabold">Olá, {name}</h1></div>
        <button onClick={onLogout} className="rounded-2xl border border-outline-variant px-4 py-3 font-bold">Sair</button>
      </header>
      {!assignment ? (
        <section className="rounded-3xl bg-white border border-outline-variant/60 p-7"><h2 className="text-xl font-extrabold">Nenhum estudante vinculado</h2><p className="mt-2 text-sm text-on-surface-variant">O responsável precisa adicionar o seu e-mail na rede de apoio.</p></section>
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          <section className="rounded-3xl bg-white border border-outline-variant/60 p-6">
            <p className="text-xs uppercase tracking-wider font-extrabold text-outline">Acompanhamento</p>
            <h2 className="text-2xl font-extrabold mt-2">{assignment.profile.name}</h2>
            <p className="text-sm text-on-surface-variant mt-2">Visualização de apoio. Alterações de perfil continuam sob controle do responsável.</p>
            <div className="mt-5 space-y-2">{tasks.map((task) => <div key={task.id} className="rounded-2xl bg-surface-container-low p-4"><strong>{task.completed ? '✓ ' : ''}{task.title}</strong><p className="text-xs mt-1 opacity-70">{task.time}</p></div>)}</div>
          </section>
          <section className="rounded-3xl bg-white border border-outline-variant/60 p-6">
            <h2 className="text-xl font-extrabold">Sinais de apoio</h2>
            <div className="mt-4 space-y-3">{requests.length ? requests.map((request) => <div key={request.id} className="rounded-2xl bg-secondary-fixed p-4"><strong>{request.kind.replace('-', ' ')}</strong><p className="text-sm mt-1">{request.message}</p><p className="text-xs mt-2 opacity-60">{new Date(request.createdAt).toLocaleString('pt-BR')}</p></div>) : <p className="text-sm text-on-surface-variant">Nenhum pedido de ajuda registrado.</p>}</div>
          </section>
        </div>
      )}
    </main>
  );
};
