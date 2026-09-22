import React, { useState } from 'react';
import { RoutineTask, SupportRequest, TutorAssignment } from '../types';

interface Props {
  name: string;
  assignments: TutorAssignment[];
  tasks: RoutineTask[];
  requests: SupportRequest[];
  onLogout: () => void;
  onSelectAssignment: (assignment: TutorAssignment) => Promise<void>;
}

export const TutorDashboard: React.FC<Props> = ({ name, assignments, tasks, requests, onLogout, onSelectAssignment }) => {
  const [activeId, setActiveId] = useState(assignments[0]?.id || '');
  const assignment = assignments.find((item) => item.id === activeId) || assignments[0];
  return (
    <main className="min-h-screen max-w-5xl mx-auto px-5 py-7">
      <header className="flex items-center justify-between gap-4 mb-7">
        <div><p className="text-sm text-on-surface-variant">Tutor ou profissional</p><h1 className="text-3xl font-extrabold">Olá, {name}</h1></div>
        <button onClick={onLogout} className="rounded-2xl border border-outline-variant px-4 py-3 font-bold">Sair</button>
      </header>
      {!assignment ? (
        <section className="rounded-3xl bg-white border border-outline-variant/60 p-7"><h2 className="text-xl font-extrabold">Nenhum estudante vinculado</h2><p className="mt-2 text-sm text-on-surface-variant">O responsável precisa adicionar o seu e-mail na rede de apoio.</p></section>
      ) : (
        <><section className="mb-5 rounded-3xl bg-white border p-4"><label className="font-bold text-sm" htmlFor="tutor-student">Estudante acompanhado</label><select id="tutor-student" value={assignment.id} onChange={async(e)=>{const selected=assignments.find((item)=>item.id===e.target.value);if(selected){setActiveId(selected.id);await onSelectAssignment(selected);}}} className="w-full mt-2 rounded-2xl border-2 p-3">{assignments.map((item)=><option key={item.id} value={item.id}>{item.profile.name}</option>)}</select></section><div className="grid lg:grid-cols-2 gap-5">
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
        </div></>
      )}
    </main>
  );
};
