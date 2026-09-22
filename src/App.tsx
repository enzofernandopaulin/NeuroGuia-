import React, { useEffect, useMemo, useState } from 'react';
import { AppView, GameProgress, ProfileOption, RoutineChangeNotice, RoutineTask, SupportRequest, SupportRequestKind, TeaProfile, TutorAssignment, UserRole } from './types';
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
import { acknowledgeRoutineChange, archiveRoutineTask, createRoutineChange, createRoutineTask, createSupportRequest, listResponsibleChanges, listResponsibleTasks, listStudentChanges, listStudentTasks, listSupportRequests, resolveSupportRequest, setTaskCompleted, setTutorTaskDuration, updateRoutineTask } from './services/routineService';
import { configureStudentAccess, getCurrentStudentProfile, getStudentAccessCode, leaveStudentRoom, revokeStudentAccessCode } from './services/studentAccessService';
import { inviteTutor, listTutorAssignments } from './services/tutorService';
import { awardStars, getGameProgress } from './services/gameService';

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
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);

  const loadResponsibleData = async (id: string) => {
    const [loadedTasks, loadedRequests, loadedChanges, code] = await Promise.all([
      listResponsibleTasks(id), listSupportRequests(id), listResponsibleChanges(id), getStudentAccessCode(id),
    ]);
    setTasks(loadedTasks); setSupportRequests(loadedRequests); setRoutineChanges(loadedChanges); setAccessCode(code);
    try { setGameProgress(await getGameProgress(id)); } catch { setGameProgress({ profileId: id, stars: 0, mascot: 'coruja', inventory: [] }); }
  };

  const selectResponsibleProfile = async (option: ProfileOption) => {
    setProfileId(option.id); setProfile(option.profile); await loadResponsibleData(option.id);
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
          const options = profiles.map((item) => ({ id: item.id, profile: mapTeaProfileRow(item) }));
          setProfiles(options);
          if (options.length) {
            const first = options[0]; setProfileId(first.id); setProfile(first.profile);
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

  useEffect(() => {
    if (!supabase || role !== 'responsavel' || !profileId) return;
    const channel = supabase.channel(`profile-live-${profileId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_requests', filter: `profile_id=eq.${profileId}` }, async () => setSupportRequests(await listSupportRequests(profileId)))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'routine_tasks', filter: `profile_id=eq.${profileId}` }, async () => setTasks(await listResponsibleTasks(profileId)))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profileId, role]);

  const nextTask = useMemo(() => tasks.find((task) => !task.completed), [tasks]);
  const toggleTask = async (id: string): Promise<boolean> => {
    const task = tasks.find((item) => item.id === id); if (!task) return false;
    const completed = !task.completed;
    setTasks((current) => current.map((item) => item.id === id ? { ...item, completed } : item));
    try {
      await setTaskCompleted(id, completed, role === 'tea');
      if (role === 'tea' && completed && profileId) {
        try { const stars = await awardStars(profileId, `task:${id}:${new Date().toISOString().slice(0,10)}`, 'tarefa', 5); setGameProgress((current) => current ? { ...current, stars } : { profileId, stars, mascot: 'coruja', inventory: [] }); } catch { /* gamificação não bloqueia a rotina */ }
      }
      return true;
    }
    catch { setTasks((current) => current.map((item) => item.id === id ? { ...item, completed: !completed } : item)); return false; }
  };
  const addTask = async (title: string, time: string, steps: string[], scheduledDate?: string, recurrenceDays: number[] = [], durationMinutes?: number | null) => {
    if (!profileId || !title.trim()) return;
    const task = await createRoutineTask(profileId, title, time, steps, scheduledDate, recurrenceDays, durationMinutes);
    setTasks((current) => [...current, task].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const handleResponsibleAuthenticated = async (name: string, isNewAccount: boolean) => {
    localStorage.setItem('neuroguia-active-role', 'responsavel'); setRole('responsavel'); setResponsibleName(name.trim() || 'Responsável');
    if (isNewAccount) { setView('responsavel-onboarding'); return; }
    const rows = await listTeaProfiles(); const options = rows.map((item) => ({ id: item.id, profile: mapTeaProfileRow(item) })); setProfiles(options);
    if (options.length) { const first = options[0]; setProfileId(first.id); setProfile(first.profile); await loadResponsibleData(first.id); setView('responsavel-dashboard'); }
    else setView('responsavel-onboarding');
  };
  const handleTutorAuthenticated = async (name: string) => {
    localStorage.setItem('neuroguia-active-role', 'tutor'); setRole('tutor'); setResponsibleName(name); await loadTutorData(); setView('tutor-dashboard');
  };
  const selectTutorAssignment = async (assignment: TutorAssignment) => {
    const [loadedTasks, loadedRequests] = await Promise.all([listResponsibleTasks(assignment.profileId), listSupportRequests(assignment.profileId)]);
    setTasks(loadedTasks); setSupportRequests(loadedRequests);
  };
  const handleStudentAuthenticated = async () => {
    const row = await getCurrentStudentProfile(); if (!row) throw new Error('O acesso do estudante não foi encontrado.');
    setRole('tea'); setProfileId(row.id); setProfile(mapTeaProfileRow(row));
    const [studentTasks, changes] = await Promise.all([listStudentTasks(row.id), listStudentChanges(row.id)]);
    setTasks(studentTasks); setRoutineChanges(changes); try { setGameProgress(await getGameProgress(row.id, true)); } catch { setGameProgress({profileId:row.id,stars:0,mascot:'coruja',inventory:[]}); } setView('tea-home');
  };
  const handleProfileComplete = async (newProfile: TeaProfile) => {
    let saved;
    if (profileId) saved = await updateTeaProfile(profileId, mapTeaProfileToUpdate(newProfile));
    else { const session = await getCurrentSession(); if (!session?.user) throw new Error('Sua sessão expirou. Entre novamente.'); saved = await createTeaProfile(newProfile, session.user.id); setProfileId(saved.id); }
    const mapped = mapTeaProfileRow(saved); setProfile(mapped); setProfileId(saved.id);
    setProfiles((items) => [...items.filter((item) => item.id !== saved.id), { id: saved.id, profile: mapped }]);
    await loadResponsibleData(saved.id); setView('responsavel-dashboard');
  };
  const logout = async () => { await signOutResponsible(); setRole('responsavel'); setView('welcome'); };
  const leaveRoom = async () => { await leaveStudentRoom(); setProfileId(null); setTasks([]); setRole('responsavel'); setView('welcome'); };

  if (!authReady) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><div className="text-2xl font-extrabold">NeuroGuia</div><div className="text-sm mt-2">Verificando sua sessão...</div></div></div>;

  return <div className={profile.softVisualMode ? 'min-h-screen bg-[#f5f5ef] text-[#273029]' : 'min-h-screen bg-background text-on-surface'}>
    {view === 'welcome' && <WelcomeAuth onResponsibleAuthenticated={handleResponsibleAuthenticated} onTeaAccess={() => setView('tea-login')} onTutorAuthenticated={handleTutorAuthenticated} />}
    {view === 'reset-password' && <ResetPassword onDone={() => setView('responsavel-dashboard')} />}
    {view === 'tea-login' && <StudentLogin onBack={() => setView('welcome')} onAuthenticated={handleStudentAuthenticated} />}
    {view === 'responsavel-onboarding' && <ResponsibleOnboarding initialProfile={profile} onBack={() => setView('welcome')} onComplete={handleProfileComplete} />}
    {view === 'responsavel-dashboard' && profileId && <ResponsibleDashboard responsibleName={responsibleName} profiles={profiles} activeProfileId={profileId} onSelectProfile={selectResponsibleProfile} onAddProfile={() => { setProfileId(null); setProfile(defaultProfile); setView('responsavel-onboarding'); }} profile={profile} tasks={tasks} onToggleTask={toggleTask} onAddTask={addTask} onUpdateTask={async(id, changes) => { await updateRoutineTask(id, changes); setTasks(await listResponsibleTasks(profileId)); }} onDeleteTask={async(id) => { await archiveRoutineTask(id); setTasks((items) => items.filter((item) => item.id !== id)); }} onEditProfile={() => setView('responsavel-onboarding')} onOpenTeaView={() => setView('tea-home')} onLogout={logout} accessCode={accessCode} supportRequests={supportRequests} routineChanges={routineChanges} gameProgress={gameProgress} onConfigureAccess={async (pin) => setAccessCode(await configureStudentAccess(profileId, pin))} onRevokeAccess={async() => { await revokeStudentAccessCode(profileId); setAccessCode(null); }} onResolveRequest={async (id) => { await resolveSupportRequest(id); setSupportRequests((items) => items.map((item) => item.id === id ? { ...item, status: 'resolvido' } : item)); }} onCreateRoutineChange={async (title, description, at) => { await createRoutineChange(profileId, title, description, at); setRoutineChanges(await listResponsibleChanges(profileId)); }} onInviteTutor={(email) => inviteTutor(profileId, email)} />}
    {view === 'tea-home' && profileId && <TeaHome profile={profile} tasks={tasks} nextTask={nextTask} gameProgress={gameProgress} onToggleTask={toggleTask} onBackToResponsible={() => setView('responsavel-dashboard')} role={role} routineChanges={routineChanges} onSupportRequest={async (kind: SupportRequestKind, task?: RoutineTask) => { await createSupportRequest(profileId, task?.id, kind, `${profile.name} solicitou apoio${task ? ` em: ${task.title}` : ''}.`); if (role === 'tea') { try { const stars = await awardStars(profileId, `support:${kind}:${Date.now()}`, kind === 'ajuda' ? 'ajuda' : 'comunicacao', 2); setGameProgress((current) => current ? {...current,stars} : current); } catch {} } }} onAcknowledgeChange={async (id) => { await acknowledgeRoutineChange(id); setRoutineChanges((items) => items.map((item) => item.id === id ? { ...item, acknowledged: true } : item)); }} onLeaveRoom={leaveRoom} />}
    {view === 'tutor-dashboard' && <TutorDashboard name={responsibleName} assignments={tutorAssignments} tasks={tasks} requests={supportRequests} onSelectAssignment={selectTutorAssignment} onLogout={logout} onSetTaskDuration={async(taskId,durationMinutes)=>{await setTutorTaskDuration(taskId,durationMinutes);setTasks((items)=>items.map((item)=>item.id===taskId?{...item,durationMinutes}:item));}} />}
  </div>;
}
