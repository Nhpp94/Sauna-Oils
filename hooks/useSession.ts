import { useState, useCallback, useMemo } from 'react';
import { Vibe, TimeOfDay, EssentialOil, OILS } from '../data/oils';
import { generateSession, SessionTrio, SessionSlot, suggestSwap, getCompatibleOils, SwapCandidate } from '../data/recommendations';
import { Blend, BLENDS } from '../data/blends';
import { Incense } from '../data/incense';
import { useMyOils } from './useMyOils';
import { useMyIncense } from './useMyIncense';
import { SavedSession } from '../context/SavedSessionsContext';

export function useSession(customOils: EssentialOil[] = []) {
  const { ownedIds } = useMyOils();
  const { ownedIncenseIds } = useMyIncense();
  const [kitOnly, setKitOnly] = useState(false);
  const [vibe, setVibe] = useState<Vibe | null>(null);
  const [time, setTime] = useState<TimeOfDay | null>(null);
  const [rounds, setRounds] = useState<SessionTrio[] | null>(null);
  const [source, setSource] = useState<'generated' | 'built'>('generated');

  const allOils = useMemo(() => [...OILS, ...customOils], [customOils]);

  const oilPool = useMemo(() => {
    if (kitOnly) return allOils.filter(o => ownedIds.has(o.id));
    return allOils;
  }, [kitOnly, allOils, ownedIds]);

  const kitBlendCount = useMemo(() => {
    if (!kitOnly) return 0;
    return BLENDS.filter(b => b.oils.every(bo => ownedIds.has(bo.id))).length;
  }, [kitOnly, ownedIds]);

  const ROUND_POSITIONS = ['opening', 'core', 'closing'] as const;

  const generateRounds = useCallback(() => {
    if (!vibe || !time) return;
    setSource('generated');
    const generated: SessionTrio[] = [];
    const usedIds = new Set<string>();
    for (let r = 0; r < 3; r++) {
      const pool = oilPool.filter(o => !usedIds.has(o.id));
      const effectivePool = pool.length >= 3 ? pool : oilPool;
      const trio = generateSession(vibe, time, effectivePool, 3, ROUND_POSITIONS[r], kitOnly ? ownedIds : undefined, kitOnly ? ownedIncenseIds : undefined);
      generated.push(trio);
      trio.slots.forEach(s => {
        if (s.kind === 'oil') usedIds.add(s.oil.id);
      });
    }
    // Use one incense for the whole session
    const sessionIncense = generated[0].incense;
    generated.forEach(trio => { trio.incense = sessionIncense; });
    setRounds(generated);
  }, [vibe, time, oilPool, kitOnly, ownedIds, ownedIncenseIds]);

  const initBuildRounds = useCallback((builtRounds: SessionTrio[], v?: Vibe | null, t?: TimeOfDay | null) => {
    setSource('built');
    if (v !== undefined) setVibe(v);
    if (t !== undefined) setTime(t);
    setRounds(builtRounds);
  }, []);

  const hydrateFromSaved = useCallback((saved: SavedSession) => {
    setSource(saved.source);
    setVibe(saved.vibe);
    setTime(saved.time);
    const normalizedRounds = saved.rounds.map(r => ({
      ...r,
      slots: r.slots.length >= 3
        ? r.slots
        : [...r.slots, ...Array(3 - r.slots.length).fill({ kind: 'empty' as const })],
    }));
    setRounds(normalizedRounds);
  }, []);

  const manualSwapInRound = useCallback((roundIndex: number, oilIdToReplace: string, newOil: EssentialOil) => {
    setRounds(prev => prev?.map((r, i) => i !== roundIndex ? r : {
      ...r,
      slots: r.slots.map(s => s.kind === 'oil' && s.oil.id === oilIdToReplace ? { kind: 'oil' as const, oil: newOil } : s),
    }) ?? null);
  }, []);

  const replaceSlotInRound = useCallback((roundIndex: number, slotIndex: number, newSlot: SessionSlot) => {
    setRounds(prev => prev?.map((r, i) => i !== roundIndex ? r : {
      ...r,
      slots: r.slots.map((s, j) => j === slotIndex ? newSlot : s),
    }) ?? null);
  }, []);

  const getSwapSuggestionForRound = useCallback((roundIndex: number, oilId: string): SwapCandidate | null => {
    if (!rounds || !vibe || !time) return null;
    const roundOilIds = rounds[roundIndex].slots
      .filter((s): s is { kind: 'oil'; oil: EssentialOil } => s.kind === 'oil')
      .map(s => s.oil.id);
    return suggestSwap(oilId, roundOilIds, vibe, time, allOils);
  }, [rounds, vibe, time, allOils]);

  const getBrowseOilsForRound = useCallback((roundIndex: number, oilId: string | null) => {
    if (!rounds) return [];
    const roundOilIds = rounds[roundIndex].slots
      .filter((s): s is { kind: 'oil'; oil: EssentialOil } => s.kind === 'oil')
      .map(s => s.oil.id);
    if (!vibe || !time) {
      return allOils
        .filter(o => !roundOilIds.includes(o.id))
        .map(o => ({ ...o, compatibilityScore: 0 as number }));
    }
    return getCompatibleOils(roundOilIds, oilId ?? '', vibe, time, allOils);
  }, [rounds, vibe, time, allOils]);

  const regenerateRound = useCallback((roundIndex: number) => {
    if (!vibe || !time || !rounds) return;
    const currentIncense = rounds[roundIndex].incense;

    // Oils used in other rounds
    const otherIds = new Set<string>();
    rounds.forEach((r, i) => {
      if (i === roundIndex) return;
      r.slots.forEach(s => { if (s.kind === 'oil') otherIds.add(s.oil.id); });
    });
    // Oils currently in this round (to maximize freshness)
    const currentIds = new Set<string>(
      rounds[roundIndex].slots
        .filter((s): s is { kind: 'oil'; oil: import('../data/oils').EssentialOil } => s.kind === 'oil')
        .map(s => s.oil.id)
    );

    const allExcluded = new Set([...otherIds, ...currentIds]);
    const freshPool = oilPool.filter(o => !allExcluded.has(o.id));
    const otherExcludedPool = oilPool.filter(o => !otherIds.has(o.id));
    const effectivePool = freshPool.length >= 3 ? freshPool
      : otherExcludedPool.length >= 3 ? otherExcludedPool
      : oilPool;

    const newTrio = generateSession(vibe, time, effectivePool, 3, ROUND_POSITIONS[roundIndex], kitOnly ? ownedIds : undefined, kitOnly ? ownedIncenseIds : undefined);
    // Preserve the existing incense — "New" only refreshes oils/blends
    setRounds(prev => prev?.map((r, i) => i === roundIndex ? { ...newTrio, incense: currentIncense } : r) ?? null);
  }, [vibe, time, rounds, oilPool, kitOnly, ownedIds, ownedIncenseIds]);

  const setRoundIncense = useCallback((roundIndex: number, incense: Incense) => {
    setRounds(prev => prev?.map((r, i) => i !== roundIndex ? r : { ...r, incense }) ?? null);
  }, []);

  const reset = useCallback(() => {
    setRounds(null);
  }, []);

  return {
    vibe, setVibe,
    time, setTime,
    kitOnly, setKitOnly,
    kitOilCount: oilPool.length,
    kitBlendCount,
    kitIncenseCount: ownedIncenseIds.size,
    rounds,
    source,
    generateRounds,
    initBuildRounds,
    hydrateFromSaved,
    regenerateRound,
    manualSwapInRound,
    replaceSlotInRound,
    getSwapSuggestionForRound,
    getBrowseOilsForRound,
    setRoundIncense,
    reset,
  };
}
