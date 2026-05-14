import type { SessionTrio } from '../data/recommendations';
import type { Category } from '../constants/categories';
import type { NoteType, TimeOfDay, Vibe } from '../data/oils';
import type { BlendOil } from '../data/blends';
import type { IncenseForm } from '../data/incense';

export interface Studio {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  join_code: string;
  created_by: string;
  created_at: string;
  created_via: 'paid' | 'promo';
  locked: boolean;
}

export interface StudioMember {
  studio_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profiles: { display_name: string | null; email: string };
}

export interface StudioSession {
  id: string;
  studio_id: string;
  name: string;
  description: string | null;
  created_by: string;
  rounds: SessionTrio[];
  vibe: string | null;
  time_of_day: string | null;
  created_at: string;
}

export interface StudioCustomOilRow {
  id: string;
  studio_id: string;
  name: string;
  latin_name: string;
  category: Category;
  note: NoteType;
  intensity: 1 | 2 | 3;
  vibes: Vibe[];
  time_of_day: TimeOfDay[];
  body_impact: string;
  sauna_note: string;
  benefits: string[];
  pairs_with: string[];
  precautions: string[];
  color: string;
  emoji: string;
  created_by: string;
  created_at: string;
}

export interface StudioCustomBlendRow {
  id: string;
  studio_id: string;
  name: string;
  description: string;
  sauna_note: string;
  oils: BlendOil[];
  vibes: Vibe[];
  time_of_day: TimeOfDay[];
  benefits: string[];
  precautions: string[];
  color: string;
  emoji: string;
  created_by: string;
  created_at: string;
}

export interface StudioCustomIncenseRow {
  id: string;
  studio_id: string;
  name: string;
  latin_name: string | null;
  origin: string;
  form: IncenseForm;
  vibes: Vibe[];
  time_of_day: TimeOfDay[];
  description: string;
  sauna_note: string;
  benefits: string[];
  precautions: string[];
  color: string;
  emoji: string;
  created_by: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}
