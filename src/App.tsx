import React, { useEffect, useMemo, useState } from 'react';
import { AppView, RoutineTask, TeaProfile, UserRole } from './types';
import { WelcomeAuth } from './components/WelcomeAuth';
import { ResetPassword } from './components/ResetPassword';
import { ResponsibleOnboarding } from './components/ResponsibleOnboarding';
import { ResponsibleDashboard } from './components/ResponsibleDashboard';
import { TeaHome } from './components/TeaHome';
import { StudentLogin } from './components/StudentLogin';
import { getStudentProfile, signOutStudent } from './services/studentAccessService';
import { TeaProfileRow } from './lib/database.types';
import { studentClient } from './services/studentAccessService';
import { completeRoutineStep, deleteRoutineTask, loadRoutine, saveRoutineTask, setRoutineCompleted } from './services/routineService';
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
  maxLaterTasks: 2,
  largeText: false,
  reduceMotion: false,
  audioInstructions: false,
};

export default function App() {
  const [view, setView] = useState<AppView>('welcome');
  const [role, setRole] = useState<UserRole>('responsavel');
  const [responsibleName, setResponsibleName] = useState('Responsável');
  const [profile, setProfile] = useState<TeaProfile>(defaultProfile);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const studentProfile = await getStudentProfile();
        if (!mounted) return;
        if (studentProfile) {
          setRole('tea'); setProfileId(studentProfile.id);
          setProfile(mapTeaProfileRow(studentProfile));
          setTasks(await loadRoutine(studentProfile.id, studentClient!));
          setView('tea-home'); return;
        }
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
          setTasks(await loadRoutine(profiles[0].id));
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

  const toggleTask = async (id: string) => {
    const task = tasks.find(item => item.id === id);
    if (!task) return;
    await setRoutineCompleted(task, !task.completed, role === 'tea' ? studentClient! : undefined);
    setTasks(current => current.map(item => item.id === id ? { ...item, completed: !task.completed } : item));
  };

  const saveTask = async (task: Pick<RoutineTask, 'title' | 'time' | 'category' | 'steps'> & { id?: string }) => {
    if (!profileId) throw new Error('Escolha um estudante primeiro.');
    await saveRoutineTask(profileId, task);
    setTasks(await loadRoutine(profileId));
  };

  const removeTask = async (id: string) => {
    if (!profileId) return;
    await deleteRoutineTask(id);
    setTasks(await loadRoutine(profileId));
  };

  const completeStep = async (taskId: string, index: number) => {
    const task = tasks.find(item => item.id === taskId);
    const stepId = task?.stepIds?.[index];
    if (!stepId) throw new Error('Etapa não encontrada.');
    await completeRoutineStep(stepId, role === 'tea' ? studentClient! : undefined);
    setTasks(current => current.map(item => item.id === taskId
      ? { ...item, completedSteps: item.completedSteps?.map((done, i) => i === index ? true : done) }
      : item));
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
      setTasks(await loadRoutine(profiles[0].id));
      setView('responsavel-dashboard');
    } else {
      setView('responsavel-onboarding');
    }
  };

  const handleProfileComplete = async (newProfile: TeaProfile) => {
    if (profileId) {
      const saved = await updateTeaProfile(profileId, mapTeaProfileToUpdate(newProfile));
      setProfile(mapTeaProfileRow(saved));
      setTasks(await loadRoutine(saved.id));
    } else {
      const session = await getCurrentSession();
      if (!session?.user) throw new Error('Sua sessão expirou. Entre novamente.');
      const saved = await createTeaProfile(newProfile, session.user.id);
      setProfileId(saved.id);
      setProfile(mapTeaProfileRow(saved));
      setTasks([]);
    }
    setView('responsavel-dashboard');
  };

  const handleLogout = async () => {
    try {
      if (supabase) await signOutResponsible();
    } finally {
      setRole('responsavel');
      setTasks([]); setProfileId(null);
      setView('welcome');
    }
  };

  const handleStudentLogin = async (studentProfile: TeaProfileRow) => {
    const studentTasks = await loadRoutine(studentProfile.id, studentClient!);
    setRole('tea'); setProfileId(studentProfile.id);
    setProfile(mapTeaProfileRow(studentProfile)); setTasks(studentTasks);
    setView('tea-home');
  };

  const handleStudentLogout = async () => {
    try { await signOutStudent(); }
    finally {
      setRole('responsavel'); setProfileId(null);
      setProfile(defaultProfile); setTasks([]); setView('welcome');
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
          onTeaAccess={async () => {
            if (supabase) await signOutResponsible();
            setRole('tea'); setView('student-login');
          }}
        />
      )}

      {view === 'student-login' && <StudentLogin onLogin={handleStudentLogin} onBack={() => setView('welcome')} />}

      {view === 'reset-password' && <ResetPassword onDone={() => setView('responsavel-dashboard')} />}

      {view === 'responsavel-onboarding' && (
        <ResponsibleOnboarding
          initialProfile={profile}
          isEditing={Boolean(profileId)}
          onBack={() => setView('welcome')}
          onComplete={handleProfileComplete}
        />
      )}

      {view === 'responsavel-dashboard' && (
        <ResponsibleDashboard
          responsibleName={responsibleName}
          profileId={profileId!}
          profile={profile}
          tasks={tasks}
          onToggleTask={toggleTask}
          onSaveTask={saveTask}
          onDeleteTask={removeTask}
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
          onCompleteStep={completeStep}
          onBackToResponsible={() => setView('responsavel-dashboard')}
          onStudentLogout={handleStudentLogout}
          role={role}
        />
      )}
    </div>
  );
}
