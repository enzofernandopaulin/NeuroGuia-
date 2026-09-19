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
  const [profiles, setProfiles] = useState<TeaProfileRow[]>([]);
  const [lastProfileId, setLastProfileId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');

  const openResponsibleProfiles = async (preferredId?: string, navigate = true) => {
    const rows = await listTeaProfiles();
    setProfiles(rows);
    if (!rows.length) {
      setProfileId(null); setProfile(defaultProfile); setTasks([]);
      if (navigate) setView('responsavel-onboarding');
      return;
    }
    const selected = rows.find(row => row.id === preferredId) ?? rows[0];
    const routine = await loadRoutine(selected.id);
    setAuthError('');
    setProfileId(selected.id); setProfile(mapTeaProfileRow(selected)); setTasks(routine);
    if (navigate) setView('responsavel-dashboard');
  };

  useEffect(() => {
    let mounted = true;
    let recoveryRequested = new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery';
    const redirectError = new URLSearchParams(window.location.hash.slice(1)).get('error_code');
    if (redirectError) {
      setAuthError('O link de acesso expirou ou não é válido. Solicite outro no formulário de entrada.');
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    const bootstrap = async () => {
      try {
        const studentProfile = studentClient ? await getStudentProfile() : null;
        if (!mounted) return;
        if (studentProfile) {
          setRole('tea'); setProfileId(studentProfile.id);
          setProfile(mapTeaProfileRow(studentProfile));
          setTasks(await loadRoutine(studentProfile.id, studentClient!));
          setView('tea-home'); return;
        }
        const session = await getCurrentSession();
        if (!mounted || !session?.user) {
          if (recoveryRequested) setAuthError('O link de recuperação expirou. Solicite outro no formulário de entrada.');
          return;
        }
        setRole('responsavel');
        setResponsibleName(
          String(session.user.user_metadata?.full_name || '').trim() ||
            session.user.email?.split('@')[0] ||
            'Responsável'
        );
        await openResponsibleProfiles(undefined, !recoveryRequested);
        if (recoveryRequested) setView('reset-password');
      } catch {
        if (mounted) {
          setAuthError('Não foi possível carregar seus dados. Verifique a conexão e tente novamente.');
          setView('welcome');
        }
      } finally {
        if (mounted) setAuthReady(true);
      }
    };

    const subscription = supabase?.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        recoveryRequested = true;
        setView('reset-password');
        setAuthReady(true);
        return;
      }

      if (event === 'SIGNED_OUT') {
        setRole('responsavel'); setProfileId(null); setProfiles([]); setTasks([]);
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
    setAuthError('');
    setRole('responsavel');
    setResponsibleName(name.trim() || 'Responsável');
    if (isNewAccount) {
      setView('responsavel-onboarding');
      return;
    }

    await openResponsibleProfiles();
  };

  const selectProfile = async (id: string) => {
    await openResponsibleProfiles(id);
  };

  const startNewProfile = () => {
    setLastProfileId(profileId); setProfileId(null);
    setProfile(defaultProfile); setTasks([]);
    setView('responsavel-onboarding');
  };

  const cancelOnboarding = async () => {
    if (profiles.length) {
      await openResponsibleProfiles(lastProfileId ?? profiles[0].id);
    } else {
      if (supabase) await signOutResponsible();
      setView('welcome');
    }
  };

  const handleProfileComplete = async (newProfile: TeaProfile) => {
    let savedId: string;
    if (profileId) {
      const saved = await updateTeaProfile(profileId, mapTeaProfileToUpdate(newProfile));
      savedId = saved.id;
    } else {
      const session = await getCurrentSession();
      if (!session?.user) throw new Error('Sua sessão expirou. Entre novamente.');
      const saved = await createTeaProfile(newProfile, session.user.id);
      savedId = saved.id;
    }
    await openResponsibleProfiles(savedId);
  };

  const handleLogout = async () => {
    try {
      if (supabase) await signOutResponsible();
      setAuthError('');
      setRole('responsavel');
      setTasks([]); setProfileId(null); setProfiles([]); setProfile(defaultProfile);
      setView('welcome');
    } catch {
      setAuthError('Não foi possível sair. Verifique a conexão e tente novamente.');
    }
  };

  const handleStudentLogin = async (studentProfile: TeaProfileRow) => {
    const studentTasks = await loadRoutine(studentProfile.id, studentClient!);
    setRole('tea'); setProfileId(studentProfile.id);
    setProfile(mapTeaProfileRow(studentProfile)); setTasks(studentTasks);
    setView('tea-home');
  };

  const handleStudentLogout = async () => {
    try {
      await signOutStudent();
      setAuthError('');
      setRole('responsavel'); setProfileId(null);
      setProfile(defaultProfile); setTasks([]); setView('welcome');
    } catch {
      setAuthError('Não foi possível sair. Verifique a conexão e tente novamente.');
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
      {authError && view !== 'welcome' && <div role="alert" className="mx-auto max-w-3xl p-3 text-sm font-bold bg-error-container text-on-error-container">{authError}</div>}
      {view === 'welcome' && (
        <WelcomeAuth
          externalNotice={authError}
          onResponsibleAuthenticated={handleResponsibleAuthenticated}
          onTeaAccess={async () => {
            if (await getCurrentSession()) await signOutResponsible();
            setAuthError('');
            setRole('tea'); setView('student-login');
          }}
        />
      )}

      {view === 'student-login' && <StudentLogin onLogin={handleStudentLogin} onBack={() => setView('welcome')} />}

      {view === 'reset-password' && <ResetPassword onDone={() => openResponsibleProfiles(profileId ?? undefined)} onCancel={async () => {
        try { await signOutResponsible(); setView('welcome'); }
        catch { setAuthError('Não foi possível sair. Verifique a conexão e tente novamente.'); }
      }} />}

      {view === 'responsavel-onboarding' && (
        <ResponsibleOnboarding
          initialProfile={profile}
          isEditing={Boolean(profileId)}
          onBack={cancelOnboarding}
          onComplete={handleProfileComplete}
        />
      )}

      {view === 'responsavel-dashboard' && (
        <ResponsibleDashboard
          responsibleName={responsibleName}
          profileId={profileId!}
          profiles={profiles.map(row => ({ id: row.id, name: row.name }))}
          profile={profile}
          onSelectProfile={selectProfile}
          onAddStudent={startNewProfile}
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
