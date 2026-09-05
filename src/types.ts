export type AppView =
  | 'welcome'
  | 'reset-password'
  | 'responsavel-onboarding'
  | 'responsavel-dashboard'
  | 'tea-home';

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
  title: string;
  time: string;
  completed: boolean;
  category?: string;
  steps?: string[];
}
