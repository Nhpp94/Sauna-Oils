import { OILS, EssentialOil, Vibe, TimeOfDay, NoteType } from './oils';
import { BLENDS, Blend } from './blends';
import { INCENSE, Incense } from './incense';

export type SessionSlot =
  | { kind: 'oil';   oil:   EssentialOil }
  | { kind: 'blend'; blend: Blend        }
  | { kind: 'empty'                      };

export interface SessionTrio {
  slots: SessionSlot[];
  narrative: string;
  incense?: Incense;
}

export interface SwapCandidate {
  oil: EssentialOil;
  reason: string;
}

const VIBE_NARRATIVES: Record<Vibe, Record<TimeOfDay, string>> = {
  energizing: {
    morning: 'Rise with intention — this bright, activating trio awakens the senses and ignites the day ahead.',
    afternoon: 'Midday surge — a refreshing reset to cut through the afternoon slump and fuel the rest of your day.',
    evening: 'Energising evening — a gentle revitalising session to close the day with presence and clarity.',
  },
  relaxing: {
    morning: 'Morning softness — ease gently into the day with an unhurried, nurturing start.',
    afternoon: 'Afternoon release — let the heat and these calming oils dissolve the tension of the day so far.',
    evening: 'Evening surrender — transition into rest with this deeply soothing combination. Let the day dissolve.',
  },
  grounding: {
    morning: 'Rooted morning — anchor your intention before the day begins. Nature calls you home.',
    afternoon: 'Midday reconnection — return to your centre with earthy depth and quiet strength.',
    evening: 'Earth & ember — descend into deep grounding as the day closes. Feel the forest around you.',
  },
  meditative: {
    morning: 'Still morning — before the noise begins, these sacred oils invite you inward. Breathe. Just be.',
    afternoon: 'Midday silence — a pause from the stream of doing. Let the steam carry your thoughts away.',
    evening: 'Deep stillness — the day falls away like mist. These oils open a door to the spaces between thoughts.',
  },
  warming: {
    morning: 'Spiced awakening — light the inner fire. These warming oils ignite circulation and prepare the body for the day ahead.',
    afternoon: 'Heat within the heat — deep spice and resin amplify the sauna\'s intensity. A full-body warmth that reaches the muscles.',
    evening: 'Winter ritual — the ancient warmth of spice and resin. Let the heat wrap around you as the cold world fades outside.',
  },
  awakening: {
    morning: 'Crisp awakening — sharp, bright, and clear. These oils cut through sleep and call you into the day.',
    afternoon: 'Afternoon spark — reignite your senses and sharpen your focus for what the day still holds.',
    evening: 'Twilight clarity — awaken your awareness one last time before the deep rest ahead.',
  },
  detox: {
    morning: 'Morning cleanse — activate your body\'s natural purification. Sweat, breathe, release.',
    afternoon: 'Deep purge — mid-session detox blast. Feel the lymphatic system come alive with these cleansing oils.',
    evening: 'Evening purification — shed the accumulated burden of the day — physical and energetic.',
  },
  creative: {
    morning: 'Inspired start — open the channels of imagination before the rational mind takes over.',
    afternoon: 'Creative heat — let the steam loosen the edges of your thinking. New ideas arise here.',
    evening: 'Twilight imagination — in the amber glow, these oils soften boundaries and invite the unexpected.',
  },
  immune: {
    morning: 'Immune ignition — arm yourself from within. These powerful oils strengthen your body\'s defences.',
    afternoon: 'Midday fortification — a potent antimicrobial blend to support your immune system through the day.',
    evening: 'Healing vigil — while you sleep, your immune system works hardest. Prepare it with this powerful trio.',
  },
};

function scoreOil(oil: EssentialOil, vibe: Vibe, time: TimeOfDay): number {
  let score = 0;
  if (oil.vibes.includes(vibe)) score += 3;
  if (oil.timeOfDay.includes(time)) score += 2;
  return score;
}

function harmonyScore(trio: EssentialOil[]): number {
  let score = 0;
  for (let i = 0; i < trio.length; i++) {
    for (let j = 0; j < trio.length; j++) {
      if (i !== j && trio[i].pairsWith.includes(trio[j].id)) {
        score++;
      }
    }
  }
  return score;
}

function noteBalance(trio: EssentialOil[]): boolean {
  const notes = trio.map(o => o.note);
  const hasTop = notes.includes('top');
  const hasMiddle = notes.includes('middle');
  const hasBase = notes.includes('base');
  return hasTop && hasMiddle && hasBase;
}

const NOTE_ORDER: Record<NoteType, number> = { base: 0, middle: 1, top: 2 };

export function generateSession(
  vibe: Vibe,
  time: TimeOfDay,
  oilPool: EssentialOil[] = OILS,
  count: number = 3,
  roundPosition: 'opening' | 'core' | 'closing' = 'core',
  ownedIds?: Set<string>,
  ownedIncenseIds?: Set<string>,
  allBlends: Blend[] = BLENDS,
  allIncense: Incense[] = INCENSE,
): SessionTrio {
  const narrative = VIBE_NARRATIVES[vibe][time];
  const incense = pickIncense(vibe, time, ownedIncenseIds, allIncense);
  const blendPool = ownedIds
    ? allBlends.filter(b => b.oils.every(bo => ownedIds!.has(bo.id)))
    : allBlends;

  const noteBias: Record<string, number> =
    roundPosition === 'opening' ? { top: 2, middle: 0, base: -1 } :
    roundPosition === 'closing' ? { top: -1, middle: 0, base: 2 } :
    { top: 0, middle: 0, base: 0 };

  // Score all oils
  const scored = oilPool
    .map(oil => ({ oil, score: scoreOil(oil, vibe, time) + (noteBias[oil.note] ?? 0) }))
    .sort((a, b) => b.score - a.score);

  const positiveScored = scored.filter(({ score }) => score > 0);
  const anyScored = positiveScored.length > 0 ? positiveScored : scored;

  // For count === 1: just one oil slot (no blend possible)
  if (count < 2) {
    const oils = anyScored.slice(0, 1).map(({ oil }) => oil);
    return { slots: oils.map(o => ({ kind: 'oil' as const, oil: o })), narrative, incense };
  }

  // For count === 2: top-2 oils (skip note-balance logic)
  if (count === 2) {
    const oils = anyScored.slice(0, 2).map(({ oil }) => oil).sort((a, b) => NOTE_ORDER[a.note] - NOTE_ORDER[b.note]);
    const matchingBlend2 = blendPool.find(b => b.vibes.includes(vibe) && b.timeOfDay.includes(time));
    if (matchingBlend2 && Math.random() < 0.35) {
      const blendOilIds2 = new Set(matchingBlend2.oils.map(bo => bo.id));
      const remaining2 = oils.filter(o => !blendOilIds2.has(o.id)).slice(0, 1);
      return {
        slots: [{ kind: 'blend', blend: matchingBlend2 }, ...remaining2.map(o => ({ kind: 'oil' as const, oil: o }))],
        narrative, incense,
      };
    }
    return { slots: oils.map(o => ({ kind: 'oil' as const, oil: o })), narrative, incense };
  }

  // For count >= 3: build a note-balanced trio as the core, then extend
  const tops = anyScored.filter(({ oil }) => oil.note === 'top').map(({ oil }) => oil);
  const middles = anyScored.filter(({ oil }) => oil.note === 'middle').map(({ oil }) => oil);
  const bases = anyScored.filter(({ oil }) => oil.note === 'base').map(({ oil }) => oil);

  let coreTrio: EssentialOil[] | null = null;
  let bestScore = -1;

  for (const top of tops.slice(0, 5)) {
    for (const mid of middles.slice(0, 5)) {
      for (const base of bases.slice(0, 5)) {
        const trio = [top, mid, base];
        const score = harmonyScore(trio) + scoreOil(top, vibe, time) + scoreOil(mid, vibe, time) + scoreOil(base, vibe, time);
        if (score > bestScore) {
          bestScore = score;
          coreTrio = trio;
        }
      }
    }
  }

  // Fallback if note groups are too sparse
  if (!coreTrio) {
    coreTrio = anyScored.slice(0, 3).map(({ oil }) => oil);
  }

  // Extend beyond 3 by greedily adding highest-scoring oils not already chosen
  let oils = [...coreTrio];
  if (count > 3) {
    const coreIds = new Set(oils.map(o => o.id));
    const extras = anyScored
      .filter(({ oil }) => !coreIds.has(oil.id))
      .slice(0, count - 3)
      .map(({ oil }) => oil);
    oils = [...oils, ...extras];
  }

  // Sort oils by note progression: base → middle → top for smooth build-up
  oils.sort((a, b) => NOTE_ORDER[a.note] - NOTE_ORDER[b.note]);

  // Check for a matching blend (~35% chance) — blend takes one slot
  const matchingBlend = blendPool.find(
    b => b.vibes.includes(vibe) && b.timeOfDay.includes(time)
  );
  if (matchingBlend && Math.random() < 0.35) {
    const blendOilIds = new Set(matchingBlend.oils.map(bo => bo.id));
    const remainingOils = oils.filter(o => !blendOilIds.has(o.id)).slice(0, count - 1);
    const slots: SessionSlot[] = [
      { kind: 'blend', blend: matchingBlend },
      ...remainingOils.map(o => ({ kind: 'oil' as const, oil: o })),
    ];
    return { slots, narrative, incense };
  }

  return { slots: oils.map(o => ({ kind: 'oil' as const, oil: o })), narrative, incense };
}

function pickIncense(vibe: Vibe, time: TimeOfDay, ownedIncenseIds?: Set<string>, incensePool: Incense[] = INCENSE): Incense | undefined {
  const allPool = ownedIncenseIds ? incensePool.filter(i => ownedIncenseIds.has(i.id)) : incensePool;
  if (allPool.length === 0) return undefined;
  const matches = allPool.filter(i => i.vibes.includes(vibe) && i.timeOfDay.includes(time));
  const pool = matches.length > 0 ? matches : allPool.filter(i => i.vibes.includes(vibe));
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function suggestSwap(
  oilIdToReplace: string,
  currentTrioIds: string[],
  vibe: Vibe,
  time: TimeOfDay,
  oilPool: EssentialOil[] = OILS,
): SwapCandidate | null {
  const currentTrio = currentTrioIds
    .filter(id => id !== oilIdToReplace)
    .map(id => oilPool.find(o => o.id === id) ?? OILS.find(o => o.id === id)!)
    .filter(Boolean);

  const replacedOil = oilPool.find(o => o.id === oilIdToReplace) ?? OILS.find(o => o.id === oilIdToReplace);
  if (!replacedOil) return null;

  const candidates = oilPool
    .filter(oil =>
      !currentTrioIds.includes(oil.id) &&
      (oil.vibes.includes(vibe) || oil.timeOfDay.includes(time))
    )
    .map(oil => {
      let score = scoreOil(oil, vibe, time);
      // Bonus for matching the same note type
      if (oil.note === replacedOil.note) score += 2;
      // Bonus for pairing well with remaining oils
      for (const existing of currentTrio) {
        if (oil.pairsWith.includes(existing.id) || existing.pairsWith.includes(oil.id)) {
          score += 2;
        }
      }
      return { oil, score };
    })
    .sort((a, b) => b.score - a.score);

  if (candidates.length === 0) return null;

  const best = candidates[0];
  const pairsWithCount = currentTrio.filter(
    existing => best.oil.pairsWith.includes(existing.id) || existing.pairsWith.includes(best.oil.id)
  ).length;

  let reason = '';
  if (pairsWithCount === 2) reason = 'Pairs beautifully with both remaining oils';
  else if (pairsWithCount === 1) reason = 'Harmonises well with the blend';
  else if (best.oil.note === replacedOil.note) reason = `Same ${best.oil.note} note — keeps the blend balanced`;
  else reason = 'Strong match for this vibe and time';

  return { oil: best.oil, reason };
}

export function getCompatibleOils(
  currentTrioIds: string[],
  oilIdToReplace: string,
  vibe: Vibe,
  time: TimeOfDay,
  oilPool: EssentialOil[] = OILS,
): (EssentialOil & { compatibilityScore: number })[] {
  const currentTrio = currentTrioIds
    .filter(id => id !== oilIdToReplace)
    .map(id => oilPool.find(o => o.id === id) ?? OILS.find(o => o.id === id)!)
    .filter(Boolean);

  return oilPool
    .filter(oil => !currentTrioIds.includes(oil.id))
    .map(oil => {
      let score = 0;
      if (oil.vibes.includes(vibe)) score += 2;
      if (oil.timeOfDay.includes(time)) score += 1;
      for (const existing of currentTrio) {
        if (oil.pairsWith.includes(existing.id) || existing.pairsWith.includes(oil.id)) {
          score += 3;
        }
      }
      return { ...oil, compatibilityScore: score };
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}
