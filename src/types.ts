export type AppView = 
  | 'welcome'
  | 'autonomo-view'
  | 'foco-home'
  | 'estudante-dashboard'
  | 'join-room'
  | 'student-room'
  | 'missoes'
  | 'mascote'
  | 'sos-overview'
  | 'sos-step1'
  | 'sos-step2'
  | 'sos-step3'
  | 'tutor-dashboard';

export type UserAccessMode = 'autonomo' | 'conectado';
export type UserRole = 'membro' | 'anfitriao' | 'estudante' | 'tutor';

export type MoodType = 
  | 'happy' 
  | 'calm' 
  | 'focused' 
  | 'curious' 
  | 'excited' 
  | 'creative' 
  | 'anxious' 
  | 'tired' 
  | 'overwhelmed' 
  | 'sad' 
  | 'frustrated';

export interface EmotionalJournalEntry {
  id: string;
  mood: MoodType;
  emoji: string;
  moodLabel: string;
  note: string;
  timestamp: string;
  isVoiceNote?: boolean;
}

export interface RoutineTask {
  id: string;
  title: string;
  time: string;
  estimatedTime?: string;
  location?: string;
  completed: boolean;
  category?: string;
}

export interface Mission {
  id: string;
  title: string;
  xp: number;
  current: number;
  target: number;
  completed: boolean;
  icon: string;
  type: 'daily' | 'season';
  description?: string;
  roomId?: string;
  roomName?: string;
  targetMember?: string;
  assignedByHost?: boolean;
}

export interface ClassroomMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'audio' | 'link';
  sizeOrDuration?: string;
  url?: string;
}

export interface RoomStudent {
  id: string;
  name: string;
  status: 'foco' | 'pausa' | 'ajuda' | 'online';
  mood?: string;
  role?: string;
  joinedAt?: string;
  currentTask?: string;
  focusMinutesToday?: number;
  sensoryPreferences?: string;
  neuroNotes?: string;
  avatarEmoji?: string;
  recentMoods?: string[];
}

export interface ClassroomMessage {
  id: string;
  author: string;
  role: 'membro' | 'anfitriao' | 'estudante' | 'tutor';
  content: string;
  timestamp: string;
  likes?: number;
}

export interface Classroom {
  id: string;
  name: string;
  activeStudents: number;
  code: string;
  hostName?: string;
  teacherName?: string;
  broadcastMessage?: string;
  currentActivity?: {
    title: string;
    description: string;
    durationMinutes: number;
    category: string;
  };
  materials?: ClassroomMaterial[];
  studentsList?: RoomStudent[];
  wallMessages?: ClassroomMessage[];
  dailyMissions?: Mission[];
  sosAlert?: string;
  sosCount?: number;
}

export type MascotType = 'lumo' | 'nori' | 'pixel' | 'soli' | 'kibo' | 'fox' | 'dog' | 'cat' | 'dino';

export interface MascotItem {
  id: string;
  name: string;
  category: 'food' | 'accessory';
  price: number;
  icon: string;
  emoji: string;
  effectDescription: string;
  energyGain?: number;
  moodGain?: number;
  expGain?: number;
}

export interface MascotInfo {
  id: MascotType;
  name: string;
  species: string;
  guardianTitle: string;
  neuroFocus: string;
  description: string;
  emoji: string;
  perk: string;
  unlockPrice: number;
  themeColor: string;
  texture: string;
  image3d?: string;
  habitat: {
    name: string;
    description: string;
    ambientVibe: string;
    bgGradient: string;
    accentColor: string;
    ambientSoundLabel: string;
  };
}

export interface MascotState {
  level: number;
  coins: number;
  mood: number; // 0-100
  energy: number; // 0-100
  exp: number;
  maxExp: number;
  selectedMascot: MascotType;
  unlockedMascots: MascotType[];
  accessory?: string;
  inventory: { [itemId: string]: number };
  lastDailyRewardDate?: string;
}
