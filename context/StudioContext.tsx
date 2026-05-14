import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { usePurchase } from './PurchaseContext';
import type { Studio, StudioCustomBlendRow, StudioCustomIncenseRow, StudioCustomOilRow, StudioMember, StudioSession } from '../types/studio';
import type { EssentialOil } from '../data/oils';
import type { Incense } from '../data/incense';
import type { Blend } from '../data/blends';

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
  studioLibraryOils: EssentialOil[];
  studioLibraryBlends: Blend[];
  studioLibraryIncense: Incense[];
  studioKitOils: EssentialOil[];
  studioKitIncense: Incense[];
  studioKitBlends: Blend[];
  studioSessions: StudioSession[];
  members: StudioMember[];
  loading: boolean;
  isAdmin: boolean;
  setActiveStudioId: (id: string | null) => void;
  joinStudio: (code: string) => Promise<string | null>;
  leaveStudio: (studioId: string) => Promise<void>;
  createStudio: (name: string, description: string, location: string, promoCode?: string) => Promise<string | null>;
  updateStudioDetails: (name: string, location: string) => Promise<string | null>;
  promoteMemberToAdmin: (userId: string) => Promise<string | null>;
  createStudioOil: (oil: EssentialOil, addToKit: boolean) => Promise<string | null>;
  deleteStudioOil: (oilId: string) => Promise<void>;
  addOilToStudioKit: (oilId: string) => Promise<string | null>;
  removeOilFromStudioKit: (oilId: string) => Promise<void>;
  addIncenseToStudioKit: (incenseId: string) => Promise<string | null>;
  removeIncenseFromStudioKit: (incenseId: string) => Promise<void>;
  createStudioIncense: (incense: Incense, addToKit: boolean) => Promise<string | null>;
  deleteStudioIncense: (incenseId: string) => Promise<void>;
  createStudioBlend: (blend: Blend, addToKit: boolean) => Promise<string | null>;
  deleteStudioBlend: (blendId: string) => Promise<void>;
  addBlendToStudioKit: (blendId: string) => Promise<string | null>;
  removeBlendFromStudioKit: (blendId: string) => Promise<void>;
  addOilToStudio: (oil: EssentialOil) => Promise<string | null>;
  removeOilFromStudio: (oilId: string) => Promise<void>;
  addSessionToStudio: (session: Omit<StudioSession, 'id' | 'studio_id' | 'created_at' | 'created_by'>) => Promise<string | null>;
  deleteStudioSession: (sessionId: string) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const StudioContext = createContext<StudioContextValue | null>(null);

function studioSchemaError(error: { message?: string; code?: string } | null) {
  if (!error?.message) return null;
  if (error.code === 'PGRST205' || error.message.includes('schema cache')) {
    return 'Studio Library tables are missing in Supabase. Run supabase-studio-library-kit.sql, then reload the schema cache.';
  }
  return error.message;
}

function rowToOil(row: StudioCustomOilRow): EssentialOil {
  return {
    id: row.id,
    name: row.name,
    latinName: row.latin_name,
    category: row.category,
    note: row.note,
    intensity: row.intensity,
    vibes: row.vibes,
    timeOfDay: row.time_of_day,
    bodyImpact: row.body_impact,
    saunaNote: row.sauna_note,
    benefits: row.benefits,
    pairsWith: row.pairs_with,
    precautions: row.precautions,
    color: row.color,
    emoji: row.emoji,
  };
}

function oilToRow(oil: EssentialOil, studioId: string, userId: string): StudioCustomOilRow {
  return {
    id: oil.id,
    studio_id: studioId,
    name: oil.name,
    latin_name: oil.latinName,
    category: oil.category,
    note: oil.note,
    intensity: oil.intensity,
    vibes: oil.vibes,
    time_of_day: oil.timeOfDay,
    body_impact: oil.bodyImpact,
    sauna_note: oil.saunaNote,
    benefits: oil.benefits,
    pairs_with: oil.pairsWith,
    precautions: oil.precautions,
    color: oil.color,
    emoji: oil.emoji,
    created_by: userId,
    created_at: new Date().toISOString(),
  };
}

function rowToBlend(row: StudioCustomBlendRow): Blend {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    saunaNote: row.sauna_note,
    oils: row.oils,
    vibes: row.vibes,
    timeOfDay: row.time_of_day,
    benefits: row.benefits,
    precautions: row.precautions,
    color: row.color,
    emoji: row.emoji,
  };
}

function blendToRow(blend: Blend, studioId: string, userId: string): StudioCustomBlendRow {
  return {
    id: blend.id,
    studio_id: studioId,
    name: blend.name,
    description: blend.description,
    sauna_note: blend.saunaNote,
    oils: blend.oils,
    vibes: blend.vibes,
    time_of_day: blend.timeOfDay,
    benefits: blend.benefits,
    precautions: blend.precautions,
    color: blend.color,
    emoji: blend.emoji,
    created_by: userId,
    created_at: new Date().toISOString(),
  };
}

function rowToIncense(row: StudioCustomIncenseRow): Incense {
  return {
    id: row.id,
    name: row.name,
    latinName: row.latin_name ?? undefined,
    origin: row.origin,
    form: row.form,
    vibes: row.vibes,
    timeOfDay: row.time_of_day,
    description: row.description,
    saunaNote: row.sauna_note,
    benefits: row.benefits,
    precautions: row.precautions,
    color: row.color,
    emoji: row.emoji,
  };
}

function incenseToRow(incense: Incense, studioId: string, userId: string): StudioCustomIncenseRow {
  return {
    id: incense.id,
    studio_id: studioId,
    name: incense.name,
    latin_name: incense.latinName ?? null,
    origin: incense.origin,
    form: incense.form,
    vibes: incense.vibes,
    time_of_day: incense.timeOfDay,
    description: incense.description,
    sauna_note: incense.saunaNote,
    benefits: incense.benefits,
    precautions: incense.precautions,
    color: incense.color,
    emoji: incense.emoji,
    created_by: userId,
    created_at: new Date().toISOString(),
  };
}

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isStudioCreatorActive } = usePurchase();
  const [studios, setStudios] = useState<StudioEntry[]>([]);
  const [studio, setStudio] = useState<Studio | null>(null);
  const [membership, setMembership] = useState<StudioMember | null>(null);
  const [studioLibraryOils, setStudioLibraryOils] = useState<EssentialOil[]>([]);
  const [studioOils, setStudioOils] = useState<EssentialOil[]>([]);
  const [studioLibraryIncense, setStudioLibraryIncense] = useState<Incense[]>([]);
  const [studioKitIncense, setStudioKitIncense] = useState<Incense[]>([]);
  const [studioLibraryBlends, setStudioLibraryBlends] = useState<Blend[]>([]);
  const [studioKitBlends, setStudioKitBlends] = useState<Blend[]>([]);
  const [studioSessions, setStudioSessions] = useState<StudioSession[]>([]);
  const [members, setMembers] = useState<StudioMember[]>([]);
  const [loading, setLoading] = useState(false);

  const isAdmin = membership?.role === 'admin';
  const studiosRef = useRef<StudioEntry[]>([]);
  studiosRef.current = studios;

  const loadStudioData = useCallback(async (studioId: string) => {
    const [kitOilsRes, customOilsRes, incenseRes, customIncenseRes, customBlendsRes, kitBlendsRes, sessionsRes] = await Promise.all([
      supabase.from('studio_oils').select('oil_id').eq('studio_id', studioId),
      supabase.from('studio_custom_oils').select('*').eq('studio_id', studioId),
      supabase.from('studio_incense').select('incense_id').eq('studio_id', studioId),
      supabase.from('studio_custom_incense').select('*').eq('studio_id', studioId),
      supabase.from('studio_custom_blends').select('*').eq('studio_id', studioId),
      supabase.from('studio_blends').select('blend_id').eq('studio_id', studioId),
      supabase.from('studio_sessions').select('*').eq('studio_id', studioId).order('created_at', { ascending: false }),
    ]);
    if (kitOilsRes.data || customOilsRes.data) {
      const { OILS } = await import('../data/oils');
      const customOils = ((customOilsRes.data ?? []) as StudioCustomOilRow[]).map(rowToOil);
      const libraryOils = [...OILS, ...customOils].sort((a, b) => a.name.localeCompare(b.name));
      const kitOilIds = new Set((kitOilsRes.data ?? []).map((r: { oil_id: string }) => r.oil_id));
      setStudioLibraryOils(libraryOils);
      setStudioOils(libraryOils.filter(o => kitOilIds.has(o.id)));
    }
    if (incenseRes.data || customIncenseRes.data) {
      const { INCENSE } = await import('../data/incense');
      const customIncense = ((customIncenseRes.data ?? []) as StudioCustomIncenseRow[]).map(rowToIncense);
      const libraryIncense = [...INCENSE, ...customIncense].sort((a, b) => a.name.localeCompare(b.name));
      const incenseIds = new Set((incenseRes.data ?? []).map((r: { incense_id: string }) => r.incense_id));
      setStudioLibraryIncense(libraryIncense);
      setStudioKitIncense(libraryIncense.filter(i => incenseIds.has(i.id)));
    }
    if (customBlendsRes.data || kitBlendsRes.data) {
      const { BLENDS } = await import('../data/blends');
      const customBlends = ((customBlendsRes.data ?? []) as StudioCustomBlendRow[]).map(rowToBlend);
      const libraryBlends = [...BLENDS, ...customBlends].sort((a, b) => a.name.localeCompare(b.name));
      const kitBlendIds = new Set((kitBlendsRes.data ?? []).map((r: { blend_id: string }) => r.blend_id));
      setStudioLibraryBlends(libraryBlends);
      setStudioKitBlends(libraryBlends.filter(b => kitBlendIds.has(b.id)));
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
      setStudioLibraryOils([]); setStudioOils([]); setStudioLibraryIncense([]); setStudioKitIncense([]); setStudioLibraryBlends([]); setStudioKitBlends([]); setStudioSessions([]); setMembers([]);
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
        setStudioLibraryOils([]); setStudioOils([]); setStudioLibraryIncense([]); setStudioKitIncense([]); setStudioLibraryBlends([]); setStudioKitBlends([]); setStudioSessions([]); setMembers([]);
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
      setMembers([]); setStudioLibraryOils([]); setStudioOils([]); setStudioLibraryIncense([]); setStudioKitIncense([]); setStudioLibraryBlends([]); setStudioKitBlends([]); setStudioSessions([]);
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
      setMembers([]); setStudioLibraryOils([]); setStudioOils([]); setStudioLibraryIncense([]); setStudioKitIncense([]); setStudioLibraryBlends([]); setStudioKitBlends([]); setStudioSessions([]);
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

      const { data: existingPaidStudio, error: existingError } = await supabase
        .from('studios')
        .select('id')
        .eq('created_by', user.id)
        .eq('created_via', 'paid')
        .maybeSingle();
      if (existingError) return existingError.message;
      if (existingPaidStudio) return 'Your subscription includes one studio. You already have a studio for this subscription.';
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

  async function updateStudioDetails(name: string, location: string): Promise<string | null> {
    if (!studio) return 'No studio';
    const trimmedName = name.trim();
    if (!trimmedName) return 'Studio name is required';

    const updates = {
      name: trimmedName,
      location: location.trim() || null,
    };
    const { data, error } = await supabase
      .from('studios')
      .update(updates)
      .eq('id', studio.id)
      .select()
      .single();
    if (error) return error.message;

    const updatedStudio = data as Studio;
    setStudio(updatedStudio);
    setStudios(prev => prev.map(entry =>
      entry.studio.id === updatedStudio.id
        ? { ...entry, studio: updatedStudio }
        : entry
    ));
    return null;
  }

  async function promoteMemberToAdmin(userId: string): Promise<string | null> {
    if (!studio) return 'No studio';
    const { error } = await supabase.rpc('promote_studio_member', {
      target_studio_id: studio.id,
      target_user_id: userId,
    });
    if (error) return error.message;

    setMembers(prev => prev.map(member =>
      member.user_id === userId ? { ...member, role: 'admin' as const } : member
    ));
    setStudios(prev => prev.map(entry =>
      entry.studio.id === studio.id
        ? {
            ...entry,
            members: entry.members.map(member =>
              member.user_id === userId ? { ...member, role: 'admin' as const } : member
            ),
          }
        : entry
    ));
    return null;
  }

  async function createStudioOil(oil: EssentialOil, addToKit: boolean): Promise<string | null> {
    if (!studio || !user) return 'No studio';
    const row = oilToRow(
      { ...oil, id: oil.id.startsWith('studio_custom_') ? oil.id : `studio_custom_${studio.id}_${Date.now()}` },
      studio.id,
      user.id,
    );
    const { error } = await supabase.from('studio_custom_oils').insert(row);
    if (error) return studioSchemaError(error);
    const createdOil = rowToOil(row);
    setStudioLibraryOils(prev => [...prev, createdOil].sort((a, b) => a.name.localeCompare(b.name)));
    if (addToKit) {
      const { error: kitError } = await supabase.from('studio_oils').insert({ studio_id: studio.id, oil_id: createdOil.id });
      if (kitError && kitError.code !== '23505') return kitError.message;
      setStudioOils(prev => prev.find(o => o.id === createdOil.id) ? prev : [...prev, createdOil].sort((a, b) => a.name.localeCompare(b.name)));
    }
    return null;
  }

  async function deleteStudioOil(oilId: string) {
    if (!studio) return;
    await supabase.from('studio_oils').delete().eq('studio_id', studio.id).eq('oil_id', oilId);
    await supabase.from('studio_custom_oils').delete().eq('studio_id', studio.id).eq('id', oilId);
    setStudioLibraryOils(prev => prev.filter(o => o.id !== oilId));
    setStudioOils(prev => prev.filter(o => o.id !== oilId));
  }

  async function addOilToStudioKit(oilId: string): Promise<string | null> {
    if (!studio) return 'No studio';
    const { error } = await supabase.from('studio_oils').insert({ studio_id: studio.id, oil_id: oilId });
    if (error && error.code !== '23505') return studioSchemaError(error);
    const oil = studioLibraryOils.find(o => o.id === oilId);
    if (oil) setStudioOils(prev => prev.find(o => o.id === oilId) ? prev : [...prev, oil].sort((a, b) => a.name.localeCompare(b.name)));
    return null;
  }

  async function removeOilFromStudioKit(oilId: string) {
    if (!studio) return;
    await supabase.from('studio_oils').delete().eq('studio_id', studio.id).eq('oil_id', oilId);
    setStudioOils(prev => prev.filter(o => o.id !== oilId));
  }

  async function addIncenseToStudioKit(incenseId: string): Promise<string | null> {
    if (!studio) return 'No studio';
    const { error } = await supabase.from('studio_incense').insert({ studio_id: studio.id, incense_id: incenseId });
    if (error && error.code !== '23505') return studioSchemaError(error);
    const incense = studioLibraryIncense.find(i => i.id === incenseId);
    if (incense) setStudioKitIncense(prev => prev.find(i => i.id === incenseId) ? prev : [...prev, incense].sort((a, b) => a.name.localeCompare(b.name)));
    return null;
  }

  async function removeIncenseFromStudioKit(incenseId: string) {
    if (!studio) return;
    await supabase.from('studio_incense').delete().eq('studio_id', studio.id).eq('incense_id', incenseId);
    setStudioKitIncense(prev => prev.filter(i => i.id !== incenseId));
  }

  async function createStudioIncense(incense: Incense, addToKit: boolean): Promise<string | null> {
    if (!studio || !user) return 'No studio';
    const row = incenseToRow(
      { ...incense, id: incense.id.startsWith('studio_custom_incense_') ? incense.id : `studio_custom_incense_${studio.id}_${Date.now()}` },
      studio.id,
      user.id,
    );
    const { error } = await supabase.from('studio_custom_incense').insert(row);
    if (error) return studioSchemaError(error);
    const createdIncense = rowToIncense(row);
    setStudioLibraryIncense(prev => [...prev, createdIncense].sort((a, b) => a.name.localeCompare(b.name)));
    if (addToKit) {
      const { error: kitError } = await supabase.from('studio_incense').insert({ studio_id: studio.id, incense_id: createdIncense.id });
      if (kitError && kitError.code !== '23505') return kitError.message;
      setStudioKitIncense(prev => prev.find(i => i.id === createdIncense.id) ? prev : [...prev, createdIncense].sort((a, b) => a.name.localeCompare(b.name)));
    }
    return null;
  }

  async function deleteStudioIncense(incenseId: string) {
    if (!studio) return;
    await supabase.from('studio_incense').delete().eq('studio_id', studio.id).eq('incense_id', incenseId);
    await supabase.from('studio_custom_incense').delete().eq('studio_id', studio.id).eq('id', incenseId);
    setStudioLibraryIncense(prev => prev.filter(i => i.id !== incenseId));
    setStudioKitIncense(prev => prev.filter(i => i.id !== incenseId));
  }

  async function createStudioBlend(blend: Blend, addToKit: boolean): Promise<string | null> {
    if (!studio || !user) return 'No studio';
    const row = blendToRow(
      { ...blend, id: blend.id.startsWith('studio_custom_blend_') ? blend.id : `studio_custom_blend_${studio.id}_${Date.now()}` },
      studio.id,
      user.id,
    );
    const { error } = await supabase.from('studio_custom_blends').insert(row);
    if (error) return studioSchemaError(error);
    const createdBlend = rowToBlend(row);
    setStudioLibraryBlends(prev => [...prev, createdBlend].sort((a, b) => a.name.localeCompare(b.name)));
    if (addToKit) {
      const { error: kitError } = await supabase.from('studio_blends').insert({ studio_id: studio.id, blend_id: createdBlend.id });
      if (kitError && kitError.code !== '23505') return kitError.message;
      setStudioKitBlends(prev => prev.find(b => b.id === createdBlend.id) ? prev : [...prev, createdBlend].sort((a, b) => a.name.localeCompare(b.name)));
    }
    return null;
  }

  async function deleteStudioBlend(blendId: string) {
    if (!studio) return;
    await supabase.from('studio_blends').delete().eq('studio_id', studio.id).eq('blend_id', blendId);
    await supabase.from('studio_custom_blends').delete().eq('studio_id', studio.id).eq('id', blendId);
    setStudioLibraryBlends(prev => prev.filter(b => b.id !== blendId));
    setStudioKitBlends(prev => prev.filter(b => b.id !== blendId));
  }

  async function addBlendToStudioKit(blendId: string): Promise<string | null> {
    if (!studio) return 'No studio';
    const { error } = await supabase.from('studio_blends').insert({ studio_id: studio.id, blend_id: blendId });
    if (error && error.code !== '23505') return studioSchemaError(error);
    const blend = studioLibraryBlends.find(b => b.id === blendId);
    if (blend) setStudioKitBlends(prev => prev.find(b => b.id === blendId) ? prev : [...prev, blend].sort((a, b) => a.name.localeCompare(b.name)));
    return null;
  }

  async function removeBlendFromStudioKit(blendId: string) {
    if (!studio) return;
    await supabase.from('studio_blends').delete().eq('studio_id', studio.id).eq('blend_id', blendId);
    setStudioKitBlends(prev => prev.filter(b => b.id !== blendId));
  }

  const addOilToStudio = async (oil: EssentialOil) => addOilToStudioKit(oil.id);
  const removeOilFromStudio = removeOilFromStudioKit;

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
      studios, studio, membership,
      studioOils, studioLibraryOils, studioLibraryBlends, studioLibraryIncense, studioKitOils: studioOils, studioKitIncense, studioKitBlends,
      studioSessions, members, loading, isAdmin,
      setActiveStudioId, joinStudio, leaveStudio, createStudio,
      updateStudioDetails, promoteMemberToAdmin,
      createStudioOil, deleteStudioOil,
      addOilToStudioKit, removeOilFromStudioKit,
      addIncenseToStudioKit, removeIncenseFromStudioKit,
      createStudioIncense, deleteStudioIncense,
      createStudioBlend, deleteStudioBlend,
      addBlendToStudioKit, removeBlendFromStudioKit,
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
