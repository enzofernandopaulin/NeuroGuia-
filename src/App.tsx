import React, { useEffect, useMemo, useState } from 'react';
import { AppView, RoutineChangeNotice, RoutineTask, SupportRequest, SupportRequestKind, TeaProfile, TutorAssignment, UserRole } from './types';
import { WelcomeAuth } from './components/WelcomeAuth';
import { ResetPassword } from './components/ResetPassword';
import { ResponsibleOnboarding } from './components/ResponsibleOnboarding';
import { ResponsibleDashboard } from './components/ResponsibleDashboard';
import { StudentLogin } from './components/StudentLogin';
import { TeaHome } from './components/TeaHome';
import { TutorDashboard } from './components/TutorDashboard';
import { supabase } from './lib/supabase';
import { getCurrentSession, signOutResponsible } from './services/authService';
import { createTeaProfile, listTeaProfiles, mapTeaProfileRow, mapTeaProfileToUpdate, updateTeaProfile } from './services/teaProfileService';
import { acknowledgeRoutineChange, createRoutineChange, createRoutineTask, createSupportRequest, listResponsibleChanges, listResponsibleTasks, listStudentChanges, listStudentTasks, listSupportRequests, resolveSupportRequest, setTaskCompleted } from './services/routineService';
import { configureStudentAccess, getCurrentStudentProfile, getStudentAccessCode, leaveStudentRoom } from './services/studentAccessService';
import { inviteTutor, listTutorAssignments } from './services/tutorService';

const defaultProfile: TeaProfile = {
  name: '', ageGroup: 'adolescente', supportLevel: 'nao-informado', communicationPreference: 'texto-imagem',
  autonomy: 'alguns-lembretes', sensoryTriggers: [], routineChangeDifficulty: 'as-vezes', softVisualMode: false,
  stepByStep: true, helpButton: true, routineChangeWarning: true,
};

export default function App() {
  const [view, setView] = useState<AppView>('welcome');
  const [role, setRole] = useState<UserRole>('responsavel');
  const [responsibleName, setResponsibleName] = useState('Responsável');
  const [profile, setProfile] = useState<TeaProfile>(defaultProfile);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [routineChanges, setRoutineChanges] = useState<RoutineChangeNotice[]>([]);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [tutorAssignments, setTutorAssignments] = useState<TutorAssignment[]>([]);
  const [authReady, setAuthReady] = useState(false);

  const loadResponsibleData = async (id: string) => {
    const [loadedTasks, loadedRequests, loadedChanges, code] = await Promise.all([
      listResponsibleTasks(id), listSupportRequests(id), listResponsibleChanges(id), getStudentAccessCode(id),
    ]);
    setTasks(loadedTasks); setSupportRequests(loadedRequests); setRoutineChanges(loadedChanges); setAccessCode(code);
  };

  const loadTutorData = async () => {
    const assignments = await listTutorAssignments();
    setTutorAssignments(assignments);
    if (!assignments.length) { setTasks([]); setSupportRequests([]); return; }
    const id = assignments[0].profileId;
    const [loadedTasks, loadedRequests] = await Promise.all([listResponsibleTasks(id), listSupportRequests(id)]);
    setTasks(loadedTasks); setSupportRequests(loadedRequests);
  };

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        const session = await getCurrentSession();
        if (session?.user) {
          const activeRole = localStorage.getItem('neuroguia-active-role');
          const name = String(session.user.user_metadata?.full_name || '').trim() || session.user.email?.split('@')[0] || 'Responsável';
          setResponsibleName(name);
          if (activeRole === 'tutor') { setRole('tutor'); await loadTutorData(); if (mounted) setView('tutor-dashboard'); return; }
          setRole('responsavel');
          const profiles = await listTeaProfiles();
          if (profiles.length) {
            const first = profiles[0]; setProfileId(first.id); setProfile(mapTeaProfileRow(first));
            await loadResponsibleData(first.id); if (mounted) setView('responsavel-dashboard');
          } else if (mounted) setView('responsavel-onboarding');
          return;
        }
        const studentProfile = await getCurrentStudentProfile();
        if (studentProfile && mounted) {
          setRole('tea'); setProfileId(studentProfile.id); setProfile(mapTeaProfileRow(studentProfile));
          const [studentTasks, changes] = await Promise.all([listStudentTasks(studentProfile.id), listStudentChanges(studentProfile.id)]);
          setTasks(studentTasks); setRoutineChanges(changes); setView('tea-home');
        }
      } finally { if (mounted) setAuthReady(true); }
    };
    const subscription = supabase?.auth.onAuthStateChange((event) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY') { setView('reset-password'); setAuthReady(true); }
      if (event === 'SIGNED_OUT') { localStorage.removeItem('neuroguia-active-role'); setView('welcome'); }
    });
    bootstrap();
    return () => { mounted = false; subscription?.data.subscription.unsubscribe(); };
  }, []);

  const nextTask = useMemo(() => tasks.find((task) => !task.completed), [tasks]);
  const toggleTask = async (id: string): Promise<boolean> => {
    const task = tasks.find((item) => item.id === id); if (!task) return false;
    const completed = !task.completed;
    setTasks((current) => current.map((item) => item.id === id ? { ...item, completed } : item));
    try { await setTaskCompleted(id, completed, role === 'tea'); return true; }
    catch { setTasks((current) => current.map((item) => item.id === id ? { ...item, completed: !completed } : item)); return false; }
  };
  const addTask = async (title: string, time: string, steps: string[]) => {
    if (!profileId || !title.trim()) return;
    const task = await createRoutineTask(profileId, title, time, steps);
    setTasks((current) => [...current, task].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const handleResponsibleAuthenticated = async (name: string, isNewAccount: boolean) => {
    localStorage.setItem('neuroguia-active-role', 'responsavel'); setRole('responsavel'); setResponsibleName(name.trim() || 'Responsável');
    if (isNewAccount) { setView('responsavel-onboarding'); return; }
    const profiles = await listTeaProfiles();
    if (profiles.length) { const first = profiles[0]; setProfileId(first.id); setProfile(mapTeaProfileRow(first)); await loadResponsibleData(first.id); setView('responsavel-dashboard'); }
    else setView('responsavel-onboarding');
  };
  const handleTutorAuthenticated = async (name: string) => {
    localStorage.setItem('neuroguia-active-role', 'tutor'); setRole('tutor'); setResponsibleName(name); await loadTutorData(); setView('tutor-dashboard');
  };
  const handleStudentAuthenticated = async () => {
    const row = await getCurrentStudentProfile(); if (!row) throw new Error('O vínculo da sala não foi encontrado.');
    setRole('tea'); setProfileId(row.id); setProfile(mapTeaProfileRow(row));
    const [studentTasks, changes] = await Promise.all([listStudentTasks(row.id), listStudentChanges(row.id)]);
    setTasks(studentTasks); setRoutineChanges(changes); setView('tea-home');
  };
  const handleProfileComplete = async (newProfile: TeaProfile) => {
    let saved;
    if (profileId) saved = await updateTeaProfile(profileId, mapTeaProfileToUpdate(newProfile));
    else { const session = await getCurrentSession(); if (!session?.user) throw new Error('Sua sessão expirou. Entre novamente.'); saved = await createTeaProfile(newProfile, session.user.id); setProfileId(saved.id); }
    setProfile(mapTeaProfileRow(saved)); await loadResponsibleData(saved.id); setView('responsavel-dashboard');
  };
  const logout = async () => { await signOutResponsible(); setRole('responsavel'); setView('welcome'); };
  const leaveRoom = async () => { await leaveStudentRoom(); setProfileId(null); setTasks([]); setRole('responsavel'); setView('welcome'); };

  if (!authReady) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><div className="text-2xl font-extrabold">NeuroGuia</div><div className="text-sm mt-2">Verificando sua sessão...</div></div></div>;

  return <div className={profile.softVisualMode ? 'min-h-screen bg-[#f5f5ef] text-[#273029]' : 'min-h-screen bg-background text-on-surface'}>
    {view === 'welcome' && <WelcomeAuth onResponsibleAuthenticated={handleResponsibleAuthenticated} onTeaAccess={() => setView('tea-login')} onTutorAuthenticated={handleTutorAuthenticated} />}
    {view === 'reset-password' && <ResetPassword onDone={() => setView('responsavel-dashboard')} />}
    {view === 'tea-login' && <StudentLogin onBack={() => setView('welcome')} onAuthenticated={handleStudentAuthenticated} />}
    {view === 'responsavel-onboarding' && <ResponsibleOnboarding initialProfile={profile} onBack={() => setView('welcome')} onComplete={handleProfileComplete} />}
    {view === 'responsavel-dashboard' && profileId && <ResponsibleDashboard responsibleName={responsibleName} profile={profile} tasks={tasks} onToggleTask={toggleTask} onAddTask={addTask} onEditProfile={() => setView('responsavel-onboarding')} onOpenTeaView={() => setView('tea-home')} onLogout={logout} accessCode={accessCode} supportRequests={supportRequests} routineChanges={routineChanges} onConfigureAccess={async (pin) => setAccessCode(await configureStudentAccess(profileId, pin))} onResolveRequest={async (id) => { await resolveSupportRequest(id); setSupportRequests((items) => items.map((item) => item.id === id ? { ...item, status: 'resolvido' } : item)); }} onCreateRoutineChange={async (title, description, at) => { await createRoutineChange(profileId, title, description, at); setRoutineChanges(await listResponsibleChanges(profileId)); }} onInviteTutor={(email) => inviteTutor(profileId, email)} />}
    {view === 'tea-home' && profileId && <TeaHome profile={profile} tasks={tasks} nextTask={nextTask} onToggleTask={toggleTask} onBackToResponsible={() => setView('responsavel-dashboard')} role={role} routineChanges={routineChanges} onSupportRequest={async (kind: SupportRequestKind, task?: RoutineTask) => createSupportRequest(profileId, task?.id, kind, `${profile.name} solicitou apoio${task ? ` em: ${task.title}` : ''}.`)} onAcknowledgeChange={async (id) => { await acknowledgeRoutineChange(id); setRoutineChanges((items) => items.map((item) => item.id === id ? { ...item, acknowledged: true } : item)); }} onLeaveRoom={leaveRoom} />}
    {view === 'tutor-dashboard' && <TutorDashboard name={responsibleName} assignments={tutorAssignments} tasks={tasks} requests={supportRequests} onLogout={logout} />}
  </div>;
}
