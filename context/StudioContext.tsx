import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { usePurchase } from './PurchaseContext';
import type { Studio, StudioMember, StudioSession } from '../types/studio';
import type { EssentialOil } from '../data/oils';

export interface StudioEntry {
  studio: Studio;
  role: 'admin' | 'member';
  members: StudioMember[];
  locked: boolean;
}

interface StudioContextValue {
  studios: StudioEntry[];
  studio: Studio | null;
  membership: StudioMember | null;
  studioOils: EssentialOil[];
  studioSessions: StudioSession[];
  members: StudioMember[];
  loading: boolean;
  isAdmin: boolean;
  setActiveStudioId: (id: string | null) => void;
  joinStudio: (code: string) => Promise<string | null>;
  leaveStudio: (studioId: string) => Promise<void>;
  createStudio: (name: string, description: string, location: string, promoCode?: string) => Promise<string | null>;
  addOilToStudio: (oil: EssentialOil) => Promise<string | null>;
  removeOilFromStudio: (oilId: string) => Promise<void>;
  addSessionToStudio: (session: Omit<StudioSession, 'id' | 'studio_id' | 'created_at' | 'created_by'>) => Promise<string | null>;
  deleteStudioSession: (sessionId: string) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const StudioContext = createContext<StudioContextValue | null>(null);

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isStudioCreatorActive } = usePurchase();
  const [studios, setStudios] = useState<StudioEntry[]>([]);
  const [studio, setStudio] = useState<Studio | null>(null);
  const [membership, setMembership] = useState<StudioMember | null>(null);
  const [studioOils, setStudioOils] = useState<EssentialOil[]>([]);
  const [studioSessions, setStudioSessions] = useState<StudioSession[]>([]);
  const [members, setMembers] = useState<StudioMember[]>([]);
  const [loading, setLoading] = useState(false);

  const isAdmin = membership?.role === 'admin';
  const studiosRef = useRef<StudioEntry[]>([]);
  studiosRef.current = studios;

  const loadStudioData = useCallback(async (studioId: string) => {
    const [oilsRes, sessionsRes] = await Promise.all([
      supabase.from('studio_oils').select('oil_id').eq('studio_id', studioId),
      supabase.from('studio_sessions').select('*').eq('studio_id', studioId).order('created_at', { ascending: false }),
    ]);
    if (oilsRes.data) {
      const { OILS } = await import('../data/oils');
      const oilIds = new Set(oilsRes.data.map((r: { oil_id: string }) => r.oil_id));
      setStudioOils(OILS.filter(o => oilIds.has(o.id)));
    }
    if (sessionsRes.data) setStudioSessions(sessionsRes.data as StudioSession[]);
  }, []);

  const computeLocked = useCallback((s: Studio, role: 'admin' | 'member', subActive: boolean) => {
    if (s.created_via === 'promo') return false;
    if (s.locked) return true;
    // For admins we can also check client-side entitlement
    if (role === 'admin' && !subActive) return true;
    return false;
  }, []);

  const loadUserStudios = useCallback(async () => {
    if (!user) {
      setStudios([]); setStudio(null); setMembership(null);
      setStudioOils([]); setStudioSessions([]); setMembers([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase
        .from('studio_members')
        .select('*, studios(*)')
        .eq('user_id', user.id);

      if (!data || data.length === 0) {
        setStudios([]); setStudio(null); setMembership(null);
        setStudioOils([]); setStudioSessions([]); setMembers([]);
        return;
      }

      const entries: StudioEntry[] = await Promise.all(
        data.map(async (row) => {
          const { data: mems } = await supabase
            .from('studio_members')
            .select('*, profiles(display_name, email)')
            .eq('studio_id', row.studio_id);
          const s = row.studios as Studio;
          return {
            studio: s,
            role: row.role as 'admin' | 'member',
            members: (mems ?? []) as StudioMember[],
            locked: computeLocked(s, row.role, isStudioCreatorActive),
          };
        })
      );
      setStudios(entries);
    } finally {
      setLoading(false);
    }
  }, [user, isStudioCreatorActive, computeLocked]);

  const setActiveStudioId = useCallback((id: string | null) => {
    if (!id || !user) {
      setStudio(null); setMembership(null);
      setMembers([]); setStudioOils([]); setStudioSessions([]);
      return;
    }
    const entry = studiosRef.current.find(e => e.studio.id === id);
    if (!entry) return;
    setStudio(entry.studio);
    setMembership({
      studio_id: entry.studio.id,
      user_id: user.id,
      role: entry.role,
      joined_at: '',
      profiles: { display_name: null, email: user.email ?? '' },
    });
    setMembers(entry.members);
    loadStudioData(id);
  }, [user, loadStudioData]);

  useEffect(() => { loadUserStudios(); }, [loadUserStudios]);

  // Re-compute locked state when subscription status changes
  useEffect(() => {
    setStudios(prev => prev.map(e => ({
      ...e,
      locked: computeLocked(e.studio, e.role, isStudioCreatorActive),
    })));
  }, [isStudioCreatorActive, computeLocked]);

  async function joinStudio(code: string): Promise<string | null> {
    if (!user) return 'Not signed in';
    const trimmed = code.trim().toUpperCase();
    const { data: studioData, error } = await supabase
      .from('studios').select('*').eq('join_code', trimmed).maybeSingle();
    if (error || !studioData) return 'Studio not found — check your code and try again';
    const { error: insertError } = await supabase.from('studio_members').insert({
      studio_id: studioData.id, user_id: user.id, role: 'member',
    });
    if (insertError) {
      if (insertError.code === '23505') return 'You are already a member of this studio';
      return insertError.message;
    }
    await loadUserStudios();
    return null;
  }

  async function leaveStudio(studioId: string) {
    if (!user) return;
    await supabase.from('studio_members').delete().eq('studio_id', studioId).eq('user_id', user.id);
    if (studio?.id === studioId) {
      setStudio(null); setMembership(null);
      setMembers([]); setStudioOils([]); setStudioSessions([]);
    }
    await loadUserStudios();
  }

  async function createStudio(name: string, description: string, location: string, promoCode?: string): Promise<string | null> {
    if (!user) return 'Not signed in';

    let createdVia: 'paid' | 'promo' = 'paid';

    if (promoCode) {
      // Validate promo code
      const { data: codeRow } = await supabase
        .from('promo_codes').select('*').eq('token', promoCode.trim().toUpperCase()).maybeSingle();
      if (!codeRow) return 'Invalid promo code';
      if (codeRow.used_at) return 'This promo code has already been used';
      createdVia = 'promo';
    } else {
      // Require active subscription
      if (!isStudioCreatorActive) return 'No active subscription — subscribe to create a studio';
    }

    const joinCode = Array.from({ length: 6 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
    ).join('');

    const { data: newStudio, error: studioError } = await supabase
      .from('studios')
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        join_code: joinCode,
        created_by: user.id,
        created_via: createdVia,
        locked: false,
      })
      .select().single();

    if (studioError) return studioError.message;

    if (promoCode) {
      await supabase.from('promo_codes')
        .update({ used_at: new Date().toISOString(), used_by: user.id })
        .eq('token', promoCode.trim().toUpperCase());
    }

    await supabase.from('studio_members').insert({ studio_id: newStudio.id, user_id: user.id, role: 'admin' });
    await loadUserStudios();
    return null;
  }

  async function addOilToStudio(oil: EssentialOil): Promise<string | null> {
    if (!studio) return 'No studio';
    const { error } = await supabase.from('studio_oils').insert({ studio_id: studio.id, oil_id: oil.id });
    if (error && error.code !== '23505') return error.message;
    setStudioOils(prev => prev.find(o => o.id === oil.id) ? prev : [...prev, oil]);
    return null;
  }

  async function removeOilFromStudio(oilId: string) {
    if (!studio) return;
    await supabase.from('studio_oils').delete().eq('studio_id', studio.id).eq('oil_id', oilId);
    setStudioOils(prev => prev.filter(o => o.id !== oilId));
  }

  async function addSessionToStudio(session: Omit<StudioSession, 'id' | 'studio_id' | 'created_at' | 'created_by'>): Promise<string | null> {
    if (!studio || !user) return 'No studio';
    const { data, error } = await supabase
      .from('studio_sessions')
      .insert({ ...session, studio_id: studio.id, created_by: user.id })
      .select().single();
    if (error) return error.message;
    setStudioSessions(prev => [data as StudioSession, ...prev]);
    return null;
  }

  async function deleteStudioSession(sessionId: string) {
    if (!studio) return;
    await supabase.from('studio_sessions').delete().eq('id', sessionId);
    setStudioSessions(prev => prev.filter(s => s.id !== sessionId));
  }

  async function removeMember(userId: string) {
    if (!studio) return;
    await supabase.from('studio_members').delete().eq('studio_id', studio.id).eq('user_id', userId);
    setMembers(prev => prev.filter(m => m.user_id !== userId));
    setStudios(prev => prev.map(e =>
      e.studio.id === studio.id
        ? { ...e, members: e.members.filter(m => m.user_id !== userId) }
        : e
    ));
  }

  return (
    <StudioContext.Provider value={{
      studios, studio, membership, studioOils, studioSessions, members, loading, isAdmin,
      setActiveStudioId, joinStudio, leaveStudio, createStudio,
      addOilToStudio, removeOilFromStudio, addSessionToStudio, deleteStudioSession,
      removeMember, refresh: loadUserStudios,
    }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used within StudioProvider');
  return ctx;
}
