import React, { useEffect, useMemo, useState } from 'react';
import { AppView, RoutineTask, TeaProfile, UserRole } from './types';
import { WelcomeAuth } from './components/WelcomeAuth';
import { ResetPassword } from './components/ResetPassword';
import { ResponsibleOnboarding } from './components/ResponsibleOnboarding';
import { ResponsibleDashboard } from './components/ResponsibleDashboard';
import { TeaHome } from './components/TeaHome';
import { supabase } from './lib/supabase';
import { getCurrentSession, signOutResponsible } from './services/authService';
import {
  createTeaProfile,
  listTeaProfiles,
  mapTeaProfileRow,
  mapTeaProfileToUpdate,
  updateTeaProfile,
} from './services/teaProfileService';

const defaultProfile: TeaProfile = {
  name: '',
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
  { id: '1', title: 'Escovar os dentes', time: '07:30', completed: false, category: 'Autocuidado', steps: ['Pegue a escova', 'Coloque a pasta', 'Escove os dentes', 'Enxágue'] },
  { id: '2', title: 'Preparar a mochila', time: '08:00', completed: false, category: 'Rotina', steps: ['Pegue a mochila', 'Separe os materiais', 'Confira o que falta'] },
  { id: '3', title: 'Fazer a atividade', time: '15:30', completed: false, category: 'Estudo', steps: ['Abra a atividade', 'Leia a primeira questão', 'Comece pela etapa mais simples'] },
];

export default function App() {
  const [view, setView] = useState<AppView>('welcome');
  const [role, setRole] = useState<UserRole>('responsavel');
  const [responsibleName, setResponsibleName] = useState('Responsável');
  const [profile, setProfile] = useState<TeaProfile>(defaultProfile);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<RoutineTask[]>(initialTasks);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const session = await getCurrentSession();
        if (!mounted || !session?.user) return;
        setRole('responsavel');
        setResponsibleName(
          String(session.user.user_metadata?.full_name || '').trim() ||
            session.user.email?.split('@')[0] ||
            'Responsável'
        );
        const profiles = await listTeaProfiles();
        if (profiles.length > 0) {
          setProfileId(profiles[0].id);
          setProfile(mapTeaProfileRow(profiles[0]));
          setView('responsavel-dashboard');
        } else {
          setView('responsavel-onboarding');
        }
      } finally {
        if (mounted) setAuthReady(true);
      }
    };

    const subscription = supabase?.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        setView('reset-password');
        setAuthReady(true);
        return;
      }

      if (event === 'SIGNED_OUT') {
        setRole('responsavel');
        setView('welcome');
        setAuthReady(true);
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        setResponsibleName(
          String(session.user.user_metadata?.full_name || '').trim() ||
            session.user.email?.split('@')[0] ||
            'Responsável'
        );
      }
    });

    bootstrap();

    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  const nextTask = useMemo(() => tasks.find((task) => !task.completed), [tasks]);

  const toggleTask = (id: string) => {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const addTask = (title: string, time: string, steps: string[]) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    setTasks((current) => [...current, {
      id: String(Date.now()),
      title: cleanTitle,
      time: time || 'Sem horário',
      completed: false,
      category: 'Rotina',
      steps: steps.filter(Boolean),
    }]);
  };

  const handleResponsibleAuthenticated = async (name: string, isNewAccount: boolean) => {
    setRole('responsavel');
    setResponsibleName(name.trim() || 'Responsável');
    if (isNewAccount) {
      setView('responsavel-onboarding');
      return;
    }

    const profiles = await listTeaProfiles();
    if (profiles.length > 0) {
      setProfileId(profiles[0].id);
      setProfile(mapTeaProfileRow(profiles[0]));
      setView('responsavel-dashboard');
    } else {
      setView('responsavel-onboarding');
    }
  };

  const handleProfileComplete = async (newProfile: TeaProfile) => {
    if (profileId) {
      const saved = await updateTeaProfile(profileId, mapTeaProfileToUpdate(newProfile));
      setProfile(mapTeaProfileRow(saved));
    } else {
      const session = await getCurrentSession();
      if (!session?.user) throw new Error('Sua sessão expirou. Entre novamente.');
      const saved = await createTeaProfile(newProfile, session.user.id);
      setProfileId(saved.id);
      setProfile(mapTeaProfileRow(saved));
    }
    setView('responsavel-dashboard');
  };

  const handleLogout = async () => {
    try {
      if (supabase) await signOutResponsible();
    } finally {
      setRole('responsavel');
      setView('welcome');
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">
        <div className="text-center">
          <div className="text-2xl font-extrabold">NeuroGuia</div>
          <div className="text-sm text-on-surface-variant mt-2">Verificando sua sessão...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={profile.softVisualMode ? 'min-h-screen bg-[#f5f5ef] text-[#273029]' : 'min-h-screen bg-background text-on-surface'}>
      {view === 'welcome' && (
        <WelcomeAuth
          onResponsibleAuthenticated={handleResponsibleAuthenticated}
          onTeaAccess={() => { setRole('tea'); setView('tea-home'); }}
        />
      )}

      {view === 'reset-password' && <ResetPassword onDone={() => setView('responsavel-dashboard')} />}

      {view === 'responsavel-onboarding' && (
        <ResponsibleOnboarding
          initialProfile={profile}
          onBack={() => setView('welcome')}
          onComplete={handleProfileComplete}
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
          onLogout={handleLogout}
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
