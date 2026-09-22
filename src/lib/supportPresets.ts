import {
  AutonomyLevel,
  CommunicationPreference,
  SupportLevel,
  TeaProfile,
} from '../types';

export type SupportExperienceMode = 'autonomo' | 'guiado' | 'acompanhado';

export interface SupportPreset {
  mode: SupportExperienceMode;
  title: string;
  description: string;
  defaultCommunication: CommunicationPreference;
  defaultAutonomy: AutonomyLevel;
  maxLaterTasks: number;
  softVisualMode: boolean;
  stepByStep: boolean;
  helpButton: boolean;
  routineChangeWarning: boolean;
}

const presets: Record<SupportLevel, SupportPreset> = {
  'nivel-1': {
    mode: 'autonomo',
    title: 'Experiência com mais autonomia',
    description: 'Agenda completa, lembretes opcionais e ajuda disponível quando necessária.',
    defaultCommunication: 'texto-imagem',
    defaultAutonomy: 'alguns-lembretes',
    maxLaterTasks: 4,
    softVisualMode: false,
    stepByStep: false,
    helpButton: true,
    routineChangeWarning: true,
  },
  'nivel-2': {
    mode: 'guiado',
    title: 'Experiência guiada',
    description: 'Menos informações simultâneas, etapas menores e ajuda sempre disponível.',
    defaultCommunication: 'texto-imagem',
    defaultAutonomy: 'orientacao-frequente',
    maxLaterTasks: 2,
    softVisualMode: true,
    stepByStep: true,
    helpButton: true,
    routineChangeWarning: true,
  },
  'nivel-3': {
    mode: 'acompanhado',
    title: 'Experiência acompanhada',
    description: 'Uma ação principal por vez, orientação contínua e participação do responsável.',
    defaultCommunication: 'imagem',
    defaultAutonomy: 'acompanhamento-total',
    maxLaterTasks: 0,
    softVisualMode: true,
    stepByStep: true,
    helpButton: true,
    routineChangeWarning: true,
  },
  'nao-informado': {
    mode: 'guiado',
    title: 'Experiência personalizável',
    description: 'Configuração equilibrada que poderá ser ajustada pelo responsável.',
    defaultCommunication: 'texto-imagem',
    defaultAutonomy: 'orientacao-etapas',
    maxLaterTasks: 2,
    softVisualMode: false,
    stepByStep: true,
    helpButton: true,
    routineChangeWarning: true,
  },
};

export function getSupportPreset(level: SupportLevel): SupportPreset {
  return presets[level];
}

export function applySupportPreset(profile: TeaProfile, level: SupportLevel): TeaProfile {
  const preset = getSupportPreset(level);

  return {
    ...profile,
    supportLevel: level,
    communicationPreference: preset.defaultCommunication,
    autonomy: preset.defaultAutonomy,
    softVisualMode: preset.softVisualMode,
    stepByStep: preset.stepByStep,
    helpButton: preset.helpButton,
    routineChangeWarning: preset.routineChangeWarning,
  };
}
