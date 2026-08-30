import React, { useState } from 'react';
import { AppView, UserRole, UserAccessMode, RoutineTask, Mission, Classroom, MascotState } from './types';
import { initialTasks, initialMissions, initialClassrooms, initialMascotState } from './mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { WelcomeAuth } from './components/WelcomeAuth';
import { AutonomousView } from './components/AutonomousView';
import { FocoHome } from './components/FocoHome';
import { StudentDashboard } from './components/StudentDashboard';
import { JoinRoom } from './components/JoinRoom';
import { StudentRoomView } from './components/StudentRoomView';
import { MissionsScreen } from './components/MissionsScreen';
import { MascotScreen } from './components/MascotScreen';
import { SosFlow } from './components/SosFlow';
import { TutorDashboard } from './components/TutorDashboard';
import { NewActivityModal } from './components/NewActivityModal';
import { NewRoomModal } from './components/NewRoomModal';
import { ScreenSwitcherModal } from './components/ScreenSwitcherModal';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('foco-home');
  const [role, setRole] = useState<UserRole>('estudante');
  const [accessMode, setAccessMode] = useState<UserAccessMode>('conectado');
  const [userName, setUserName] = useState<string>('Alex');

  // Interactive persistent state
  const [tasks, setTasks] = useState<RoutineTask[]>(initialTasks);
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [classrooms, setClassrooms] = useState<Classroom[]>(initialClassrooms);
  const [joinedRoomIds, setJoinedRoomIds] = useState<string[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [mascotState, setMascotState] = useState<MascotState>(initialMascotState);

  // Modals
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState(false);
  const [isScreenSwitcherOpen, setIsScreenSwitcherOpen] = useState(false);

  // Handlers
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (newTask: RoutineTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateMission = (id: string) => {
    setMissions((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              current: m.target,
              completed: true,
            }
          : m
      )
    );
  };

  const handleAddRoom = (newRoom: Classroom) => {
    setClassrooms((prev) => [newRoom, ...prev]);
  };

  const handleUpdateRoom = (updatedRoom: Classroom) => {
    setClassrooms((prev) =>
      prev.map((c) => (c.id === updatedRoom.id ? updatedRoom : c))
    );
  };

  const handleSendRoomMissions = (roomId: string, newMissions: Mission[]) => {
    setMissions((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const toAdd = newMissions.filter((m) => !existingIds.has(m.id));
      return [...toAdd, ...prev];
    });

    setClassrooms((prev) =>
      prev.map((c) => {
        if (c.id === roomId) {
          const currentMissions = c.dailyMissions || [];
          const existingIds = new Set(currentMissions.map((m) => m.id));
          const toAdd = newMissions.filter((m) => !existingIds.has(m.id));
          return {
            ...c,
            dailyMissions: [...toAdd, ...currentMissions],
          };
        }
        return c;
      })
    );
  };

  const handleDeleteMission = (id: string) => {
    setMissions((prev) => prev.filter((m) => m.id !== id));
    setClassrooms((prev) =>
      prev.map((c) => ({
        ...c,
        dailyMissions: (c.dailyMissions || []).filter((m) => m.id !== id),
      }))
    );
  };

  const handleEditMission = (updatedMission: Mission) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === updatedMission.id ? updatedMission : m))
    );
    setClassrooms((prev) =>
      prev.map((c) => ({
        ...c,
        dailyMissions: (c.dailyMissions || []).map((m) =>
          m.id === updatedMission.id ? updatedMission : m
        ),
      }))
    );
  };

  const handleJoinClassroom = (code: string) => {
    const rawCode = code.trim().toUpperCase();
    const cleanCode = rawCode.replace(/[^A-Z0-9]/g, '');

    const existing = classrooms.find(
      (c) => c.code.replace(/[^A-Z0-9]/g, '').toLowerCase() === cleanCode.toLowerCase()
    );

    const newMemberProfile = {
      id: `std_${Date.now()}`,
      name: `${userName} (Você)`,
      status: 'foco' as const,
      mood: '😊 Focado',
      role: 'Membro',
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      currentTask: 'Sessão de Foco em Grupo',
      focusMinutesToday: 20,
      sensoryPreferences: 'Prefere ambiente silencioso, iluminação suave e estímulos visuais organizados.',
      neuroNotes: 'Perfil integrado e conectado à sala via código de acesso.',
      avatarEmoji: '👤',
      recentMoods: ['😊 Focado', '😌 Calmo'],
    };

    if (existing) {
      setSelectedRoomId(existing.id);
      setJoinedRoomIds((prev) => (prev.includes(existing.id) ? prev : [...prev, existing.id]));
      setClassrooms((prev) =>
        prev.map((c) => {
          if (c.id === existing.id) {
            const list = c.studentsList || [];
            const alreadyIn = list.some((s) => s.name.includes(userName));
            const updatedList = alreadyIn ? list : [...list, newMemberProfile];
            return {
              ...c,
              activeStudents: updatedList.length,
              studentsList: updatedList,
            };
          }
          return c;
        })
      );
    } else {
      // Create joined room dynamically if code wasn't pre-existing
      const newJoinedRoom: Classroom = {
        id: `c_${Date.now()}`,
        name: `Sala (${rawCode})`,
        hostName: 'Anfitrião Conectado',
        teacherName: 'Anfitrião Conectado',
        activeStudents: 1,
        code: rawCode,
        broadcastMessage: 'Seja bem-vindo(a) à nova sala de foco! Sinta-se acolhido(a).',
        currentActivity: {
          title: 'Sessão de Foco Guiada',
          description: 'Acompanhe as orientações do anfitrião e interaja no mural.',
          durationMinutes: 25,
          category: 'study',
        },
        studentsList: [newMemberProfile],
        materials: [],
        wallMessages: [],
      };
      setClassrooms((prev) => [newJoinedRoom, ...prev]);
      setJoinedRoomIds((prev) => [...prev, newJoinedRoom.id]);
      setSelectedRoomId(newJoinedRoom.id);
    }
  };

  const handleAddCoins = (amount: number) => {
    setMascotState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      exp: prev.exp + Math.round(amount / 2),
    }));
  };

  const handleLoginSuccess = (
    selectedRole: UserRole,
    displayName: string,
    mode: UserAccessMode = 'conectado'
  ) => {
    setRole(selectedRole);
    setUserName(displayName);
    setAccessMode(mode);
    if (mode === 'autonomo') {
      setCurrentView('autonomo-view');
    } else {
      setCurrentView(selectedRole === 'tutor' ? 'tutor-dashboard' : 'foco-home');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans selection:bg-primary-container selection:text-on-primary-container">
      {/* Fixed Top Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        role={role}
        setRole={setRole}
        onOpenScreenSwitcher={() => setIsScreenSwitcherOpen(true)}
      />

      {/* Main Screen Router */}
      <main className="min-h-screen">
        {currentView === 'welcome' && (
          <WelcomeAuth
            onLoginSuccess={handleLoginSuccess}
            setCurrentView={setCurrentView}
            role={role}
            setRole={setRole}
          />
        )}

        {currentView === 'autonomo-view' && (
          <AutonomousView
            setCurrentView={setCurrentView}
            onSwitchToConnectedMode={() => {
              setAccessMode('conectado');
              setCurrentView('welcome');
            }}
            onAddCoins={handleAddCoins}
          />
        )}

        {currentView === 'foco-home' && (
          <FocoHome
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
            onAddCoins={handleAddCoins}
          />
        )}

        {currentView === 'estudante-dashboard' && (
          <StudentDashboard
            tasks={tasks}
            onToggleTask={handleToggleTask}
            setCurrentView={setCurrentView}
            userName={userName}
            onAddCoins={handleAddCoins}
          />
        )}

        {currentView === 'join-room' && (
          <JoinRoom
            onJoinSuccess={handleJoinClassroom}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'student-room' && (
          <StudentRoomView
            classrooms={classrooms}
            joinedRoomIds={joinedRoomIds}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
            onJoinRoomCode={handleJoinClassroom}
            setCurrentView={setCurrentView}
            userName={userName}
            onAddCoins={handleAddCoins}
            onUpdateRoom={handleUpdateRoom}
          />
        )}

        {currentView === 'missoes' && (
          <MissionsScreen
            missions={missions}
            onUpdateMission={handleUpdateMission}
            onAddCoins={handleAddCoins}
            classrooms={classrooms}
            role={role}
            onUpdateRoom={handleUpdateRoom}
            onSendRoomMissions={handleSendRoomMissions}
            onDeleteMission={handleDeleteMission}
            onEditMission={handleEditMission}
          />
        )}

        {currentView === 'mascote' && (
          <MascotScreen
            mascotState={mascotState}
            setMascotState={setMascotState}
            role={role}
            classrooms={classrooms}
          />
        )}

        {currentView.startsWith('sos') && (
          <SosFlow currentView={currentView} setCurrentView={setCurrentView} />
        )}

        {currentView === 'tutor-dashboard' && (
          <TutorDashboard
            classrooms={classrooms}
            onOpenNewRoomModal={() => setIsNewRoomModalOpen(true)}
            onUpdateRoom={handleUpdateRoom}
            setCurrentView={setCurrentView}
            onSendRoomMissions={handleSendRoomMissions}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        role={role}
      />

      {/* Interactive Modals */}
      <NewActivityModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />

      <NewRoomModal
        isOpen={isNewRoomModalOpen}
        onClose={() => setIsNewRoomModalOpen(false)}
        onAddRoom={handleAddRoom}
      />

      <ScreenSwitcherModal
        isOpen={isScreenSwitcherOpen}
        onClose={() => setIsScreenSwitcherOpen(false)}
        currentView={currentView}
        setCurrentView={setCurrentView}
        role={role}
        setRole={setRole}
      />
    </div>
  );
}
