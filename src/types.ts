export type AppView =
  | 'welcome'
  | 'reset-password'
  | 'responsavel-onboarding'
  | 'responsavel-dashboard'
  | 'tea-login'
  | 'tea-home'
  | 'tutor-dashboard';

export type UserRole = 'responsavel' | 'tea' | 'tutor';
export type SupportLevel = 'nivel-1' | 'nivel-2' | 'nivel-3' | 'nao-informado';
export type CommunicationPreference = 'texto' | 'imagem' | 'texto-imagem' | 'audio' | 'nao-sei';
export type AutonomyLevel =
  | 'alguns-lembretes'
  | 'orientacao-etapas'
  | 'orientacao-frequente'
  | 'acompanhamento-total';
export type RoutineChangeDifficulty = 'nao' | 'as-vezes' | 'frequentemente';
export type SensoryTrigger =
  | 'cores'
  | 'brilho'
  | 'animacoes'
  | 'sons'
  | 'vibracao'
  | 'excesso-informacao';

export interface TeaProfile {
  name: string;
  ageGroup: 'crianca' | 'adolescente' | 'adulto';
  supportLevel: SupportLevel;
  communicationPreference: CommunicationPreference;
  autonomy: AutonomyLevel;
  sensoryTriggers: SensoryTrigger[];
  routineChangeDifficulty: RoutineChangeDifficulty;
  softVisualMode: boolean;
  stepByStep: boolean;
  helpButton: boolean;
  routineChangeWarning: boolean;
}

export interface RoutineTask {
  id: string;
  profileId?: string;
  title: string;
  time: string;
  completed: boolean;
  category?: string;
  steps?: string[];
  scheduledDate?: string;
  updatedAt?: string;
  sortOrder?: number;
  recurrenceDays?: number[];
  archived?: boolean;
  durationMinutes?: number | null;
}

export type SupportRequestKind = 'ajuda' | 'nao-entendi' | 'me-perdi';
export type SupportRequestStatus = 'pendente' | 'visualizado' | 'resolvido';

export interface SupportRequest {
  id: string;
  profileId: string;
  taskId?: string | null;
  kind: SupportRequestKind;
  message: string;
  status: SupportRequestStatus;
  createdAt: string;
}

export interface RoutineChangeNotice {
  id: string;
  profileId: string;
  title: string;
  description: string;
  effectiveAt: string;
  acknowledged: boolean;
}

export interface StudentAccessInfo {
  code: string;
  configured: boolean;
}

export interface TutorAssignment {
  id: string;
  profileId: string;
  tutorEmail: string;
  profile: TeaProfile;
  canRespond?: boolean;
}

export interface ProfileOption { id: string; profile: TeaProfile; }
export interface GameProgress {
  profileId: string;
  stars: number;
  mascot: string;
  equippedItem?: string | null;
  inventory: string[];
}
