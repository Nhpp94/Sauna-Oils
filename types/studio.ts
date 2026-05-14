import type { SessionTrio } from '../data/recommendations';

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

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}
