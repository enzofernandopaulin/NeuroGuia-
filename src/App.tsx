import React, { useMemo, useState } from 'react';
import { AppView, RoutineTask, TeaProfile, UserRole } from './types';
import { WelcomeAuth } from './components/WelcomeAuth';
import { ResponsibleOnboarding } from './components/ResponsibleOnboarding';
import { ResponsibleDashboard } from './components/ResponsibleDashboard';
import { TeaHome } from './components/TeaHome';

const defaultProfile: TeaProfile = {
  name: 'Lucas',
  ageGroup: 'adolescente',
  supportLevel: 'nao-informado',
  communicationPreference: 'texto-imagem',
  autonomy: 'alguns-lembretes',
  sensoryTriggers: [],
  routineChangeDifficulty: 'as-vezes',
  softVisualMode: false,
  stepByStep: true,
  helpButton: true,
  routineChangeWarning: true,
};

const initialTasks: RoutineTask[] = [
  {
    id: '1',
    title: 'Escovar os dentes',
    time: '07:30',
    completed: false,
    category: 'Autocuidado',
    steps: ['Pegue a escova', 'Coloque a pasta', 'Escove os dentes', 'Enxágue'],
  },
  {
    id: '2',
    title: 'Preparar a mochila',
    time: '08:00',
    completed: false,
    category: 'Rotina',
    steps: ['Pegue a mochila', 'Separe os materiais', 'Confira o que falta'],
  },
  {
    id: '3',
    title: 'Fazer a atividade',
    time: '15:30',
    completed: false,
    category: 'Estudo',
    steps: ['Abra a atividade', 'Leia a primeira questão', 'Comece pela etapa mais simples'],
  },
];

export default function App() {
  const [view, setView] = useState<AppView>('welcome');
  const [role, setRole] = useState<UserRole>('responsavel');
  const [responsibleName, setResponsibleName] = useState('Responsável');
  const [profile, setProfile] = useState<TeaProfile>(defaultProfile);
  const [tasks, setTasks] = useState<RoutineTask[]>(initialTasks);

  const nextTask = useMemo(
    () => tasks.find((task) => !task.completed),
    [tasks]
  );

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const addTask = (title: string, time: string, steps: string[]) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    setTasks((current) => [
      ...current,
      {
        id: String(Date.now()),
        title: cleanTitle,
        time: time || 'Sem horário',
        completed: false,
        category: 'Rotina',
        steps: steps.filter(Boolean),
      },
    ]);
  };

  const handleAccess = (selectedRole: UserRole, name: string, isNewAccount: boolean) => {
    setRole(selectedRole);

    if (selectedRole === 'responsavel') {
      setResponsibleName(name.trim() || 'Responsável');
      setView(isNewAccount ? 'responsavel-onboarding' : 'responsavel-dashboard');
      return;
    }

    if (selectedRole === 'tea') {
      setView('tea-home');
      return;
    }

    setView('welcome');
  };

  return (
    <div className={profile.softVisualMode ? 'min-h-screen bg-[#f5f5ef] text-[#273029]' : 'min-h-screen bg-background text-on-surface'}>
      {view === 'welcome' && <WelcomeAuth onAccess={handleAccess} />}

      {view === 'responsavel-onboarding' && (
        <ResponsibleOnboarding
          initialProfile={profile}
          onBack={() => setView('welcome')}
          onComplete={(newProfile) => {
            setProfile(newProfile);
            setView('responsavel-dashboard');
          }}
        />
      )}

      {view === 'responsavel-dashboard' && (
        <ResponsibleDashboard
          responsibleName={responsibleName}
          profile={profile}
          tasks={tasks}
          onToggleTask={toggleTask}
          onAddTask={addTask}
          onEditProfile={() => setView('responsavel-onboarding')}
          onOpenTeaView={() => setView('tea-home')}
          onLogout={() => setView('welcome')}
        />
      )}

      {view === 'tea-home' && (
        <TeaHome
          profile={profile}
          tasks={tasks}
          nextTask={nextTask}
          onToggleTask={toggleTask}
          onBackToResponsible={() => setView('responsavel-dashboard')}
          role={role}
        />
      )}
    </div>
  );
}
