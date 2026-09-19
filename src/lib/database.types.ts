import {
  AutonomyLevel,
  CommunicationPreference,
  RoutineChangeDifficulty,
  SensoryTrigger,
  SupportLevel,
  TeaProfile,
} from '../types';

export interface TeaProfileRow {
  id: string;
  responsible_id: string;
  name: string;
  avatar_url: string | null;
  age_group: TeaProfile['ageGroup'];
  support_level: SupportLevel;
  communication_preference: CommunicationPreference;
  autonomy: AutonomyLevel;
  sensory_triggers: SensoryTrigger[];
  routine_change_difficulty: RoutineChangeDifficulty;
  soft_visual_mode: boolean;
  step_by_step: boolean;
  help_button: boolean;
  routine_change_warning: boolean;
  created_at: string;
  updated_at: string;
}

export type TeaProfileInsert = Omit<TeaProfileRow, 'id' | 'created_at' | 'updated_at'>;
export type TeaProfileUpdate = Partial<
  Omit<TeaProfileRow, 'id' | 'responsible_id' | 'created_at' | 'updated_at'>
>;
