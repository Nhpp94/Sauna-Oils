// SVG botanical stroke paths — hand-drawn pen-sketch style.
// All entries: style 'stroke', viewBox '0 0 24 24'.
// Rendered with strokeLinecap="round", strokeLinejoin="round", strokeWidth=1.8.

export interface BotanicalPath {
  viewBox: string;
  paths: string[];
  style: 'fill' | 'stroke';
  circles?: Array<{ cx: number; cy: number; r: number }>;
}

export const BOTANICAL_PATHS: Record<string, BotanicalPath> = {

  // ── Star (custom items) ───────────────────────────────────────────────────
  star: {
    viewBox: '0 0 24 24',
    style: 'stroke',
    paths: [
      'M12 3 L14.2 8.9 L20.6 9.2 L16 13.8 L17.3 19.3 L12 16.2 L6.7 19.3 L8 13.8 L3.4 9.2 L9.8 8.9 Z',
    ],
  },

  // ── Citrus cross-section ─────────────────────────────────────────────────
  // Outer rind ring + inner pith ring + 6 radial segment lines from centre
  citrus: {
    viewBox: '0 0 24 24',
    style: 'stroke',
    paths: [
      'M2 12 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0',
      'M5 12 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0',
      'M12 5 L12 12 M18.1 8.5 L12 12 M18.1 15.5 L12 12 M12 19 L12 12 M5.9 15.5 L12 12 M5.9 8.5 L12 12',
    ],
  },

  // ── Eucalyptus branch ────────────────────────────────────────────────────
  // Arching stem with 3 paired oval leaves + midrib veins (oregano style)
  'eucalyptus-leaf': {
    viewBox: '0 0 24 24',
    style: 'stroke',
    paths: [
      // main arching branch
      'M5 21 C7 15 14 9 20 4',
      // lower leaf pair with midribs
      'M8 18 C6.5 16 7 14 9 14.5 C10 15 9.5 17 8 18 M8.5 17 L9.5 15',
      'M8 18 C9.5 16 11 14.5 12 15.5 C11.5 17 9.5 18.5 8 18 M9 17 L10.5 15.5',
      // middle leaf pair with midribs
      'M13 13 C11.5 11 12 9 14 9.5 C15 10 14.5 12 13 13 M13.5 12 L14 10',
      'M13 13 C14.5 11 16 9.5 17 10.5 C16.5 12 14.5 13.5 13 13 M14 12 L15.5 10.5',
      // upper leaf pair with midribs
      'M17 8 C15.5 6 16 4 18 4.5 C19 5 18.5 7 17 8 M17.5 7 L18 5',
      'M17 8 C18.5 6.5 19.5 5 20 5.5 C20 7 18.5 8.5 17 8 M18 7 L19.5 5.5',
    ],
  },

  // ── Mint / herb branch ───────────────────────────────────────────────────
  // Slightly S-curved stem with 3 pairs of rounded organic leaves
  'mint-sprig': {
    viewBox: '0 0 24 24',
    style: 'stroke',
    paths: [
      'M12 22 C11.5 16 12.5 10 12 3',
      // lower pair
      'M12 19 C9.5 18 8 16 9.5 14.5 C11 14 12 15.5 12 18',
      'M12 18 C14.5 17 16 15 14.5 13.5 C13 13 12 14.5 12 17',
      // mid pair
      'M12 14 C9.5 13 8 11 9.5 9.5 C11 9 12 10.5 12 13',
      'M12 13 C14.5 12 16 10 14.5 8.5 C13 8 12 9.5 12 12',
      // upper pair
      'M12 9 C10 8 8.5 6 10 5 C11 4.5 12 5.5 12 8',
      'M12 8 C14 7 15.5 5 14 4 C13 3.5 12 4.5 12 7',
    ],
  },

  // ── Herb sprig — rosemary / thyme style ──────────────────────────────────
  // Tall slightly-leaning stem with alternating tiny paired leaves (rosemary/thyme)
  sprout: {
    viewBox: '0 0 24 24',
    style: 'stroke',
    paths: [
      // main stem — slight lean
      'M11.5 22 C11.8 17 12.2 10 12 3',
      // left leaves — compound path of 6 small curved strokes
      'M11.5 20 C10 19.5 9 18.5 10 18 M11.8 17 C10.3 16.5 9.3 15.5 10.3 15 M11.8 14 C10 13.5 9 12.5 10 12 M12 11 C10.5 10.5 9.5 9.5 10.5 9 M12 8 C10.5 7.5 10 6.5 11 6 M12 5.5 C10.8 5 10.3 4 11.5 3.8',
      // right leaves — compound path of 6 small curved strokes
      'M11.8 19 C13.3 18.5 14.3 17.5 13.3 17 M11.5 16 C13 15.5 14 14.5 13 14 M11.5 13 C13 12.5 14 11.5 13 11 M11.8 10 C13.3 9.5 14 8.5 13 8 M12 7 C13.5 6.5 14 5.5 13 5 M12 4.5 C13.2 4 13.5 3 12.5 2.8',
    ],
  },

  // ── Pine / conifer tree ───────────────────────────────────────────────────
  // Vertical trunk with 5 symmetric branch tiers narrowing toward top
  'pine-branch': {
    viewBox: '0 0 24 24',
    style: 'stroke',
    paths: [
      'M12 22 L12 5',
      'M12 20 L6 17 M12 20 L18 17',
      'M12 17 L7.5 14 M12 17 L16.5 14',
      'M12 14 L9 11 M12 14 L15 11',
      'M12 11 L10 8 M12 11 L14 8',
      'M12 8 L11 6 M12 8 L13 6',
    ],
  },

  // ── Wood cross-section rings — sandalwood ─────────────────────────────────
  // 4 concentric rings + 3 short radial grain marks at the bark
  'sandalwood-ring': {
    viewBox: '0 0 24 24',
    style: 'stroke',
    paths: [
      'M2 12 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0',
      'M5.5 12 a6.5 6.5 0 1 0 13 0 a6.5 6.5 0 1 0 -13 0',
      'M8.5 12 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0',
      'M10.5 12 a1.5 1.5 0 1 0 3 0 a1.5 1.5 0 1 0 -3 0',
      'M12 2 L12 5.5 M19.5 7 L16.8 8.5 M19.5 17 L16.8 15.5',
    ],
  },

  // ── Maple leaf ────────────────────────────────────────────────────────────
  // 5-lobe bezier outline + 5 radiating veins + short stem
  'maple-leaf': {
    viewBox: '0 0 24 24',
    style: 'stroke',
    paths: [
      // stem
      'M12 22 L12 17',
      // 5-lobe leaf outline
      'M12 17 C9.5 16.5 7 15 7 12.5 C5 12 3.5 10 5 8 C4 6 6 5.5 7.5 7 C7 4.5 9 3 10.5 4.5 C10.5 2 11.5 1.5 12 2 C12.5 1.5 13.5 2 13.5 4.5 C15 3 17 4.5 16.5 7 C18 5.5 20 6 19 8 C20.5 10 19 12 17 12.5 C17 15 14.5 16.5 12 17',
      // veins
      'M12 17 L12 9 M12 12 L8 7.5 M12 12 L16 7.5 M12 9.5 L10 6 M12 9.5 L14 6',
    ],
  },

  // ── Grass blades — vetiver / lemongrass ──────────────────────────────────
  // Three arching blades of varying height + small node marks
  'grass-blade': {
    viewBox: '0 0 24 24',
    style: 'stroke',
    paths: [
      'M7 22 C6.5 18 5 12 6 4',
      'M12 22 C11.5 17 12.5 10 12 2',
      'M17 22 C17.5 18 19 12 18 4',
      // node marks on left blade
      'M6.2 16 L7.2 16 M5.8 11 L6.8 10.8 M6.2 7 L7 7',
      // node marks on centre blade
      'M11.5 15 L12.5 15 M11.5 10 L12.5 9.8 M11.8 6 L12.5 6',
      // node marks on right blade
      'M17.2 16 L18.2 16.5 M17.8 11 L18.8 11.5 M17.5 7 L18.5 7.5',
    ],
  },

  // ── Lavender spike ────────────────────────────────────────────────────────
  // Straight stem + 3 paired bud clusters + pointed tip bud
  'lavender-sprig': {
    viewBox: '0 0 24 24',
    style: 'stroke',
    paths: [
      'M12 22 L12 7',
      // lower bud pair
      'M12 17 C10.5 16 10 15 10.5 14 C11 13.5 12 14.5 12 16',
      'M12 17 C13.5 16 14 15 13.5 14 C13 13.5 12 14.5 12 16',
      // middle bud pair
      'M12 12 C10.5 11 10 10 10.5 9 C11 8.5 12 9.5 12 11',
      'M12 12 C13.5 11 14 10 13.5 9 C13 8.5 12 9.5 12 11',
      // upper bud pair
      'M12 7 C10.5 6 10 5 10.5 4 C11 3.5 12 4.5 12 6',
      'M12 7 C13.5 6 14 5 13.5 4 C13 3.5 12 4.5 12 6',
      // tip bud
      'M12 4 C11.5 3 11.5 2 12 2 C12.5 2 12.5 3 12 4',
    ],
  },

  // ── Chamomile / daisy ─────────────────────────────────────────────────────
  // Centre disc + 8 elongated petal ovals + short stem
  chamomile: {
    viewBox: '0 0 24 24',
    style: 'stroke',
    paths: [
      // centre disc
      'M9.5 11 a2.5 2.5 0 1 0 5 0 a2.5 2.5 0 1 0 -5 0',
      // cardinal petals
      'M12 8.5 C11.2 7 11.2 5.5 12 5 C12.8 5.5 12.8 7 12 8.5',
      'M12 13.5 C11.2 15 11.2 16.5 12 17 C12.8 16.5 12.8 15 12 13.5',
      'M9.5 11 C8 10.2 6.5 10.2 6 11 C6.5 11.8 8 11.8 9.5 11',
      'M14.5 11 C16 10.2 17.5 10.2 18 11 C17.5 11.8 16 11.8 14.5 11',
      // diagonal petals
      'M10.2 9.3 C9 8.1 8 7 8.5 6.3 C9.2 6.2 10.4 7 10.2 9.3',
      'M13.8 9.3 C15 8.1 16 7 15.5 6.3 C14.8 6.2 13.6 7 13.8 9.3',
      'M10.2 12.7 C9 13.9 8 15 8.5 15.7 C9.2 15.8 10.4 15 10.2 12.7',
      'M13.8 12.7 C15 13.9 16 15 15.5 15.7 C14.8 15.8 13.6 15 13.8 12.7',
      // stem
      'M12 17 L12 22',
    ],
  },

  // ── Peppercorn cluster ────────────────────────────────────────────────────
  // Three round berries (triangle arrangement) on short branch stems
  peppercorn: {
    viewBox: '0 0 24 24',
    style: 'stroke',
    circles: [
      { cx: 8.5,  cy: 15.5, r: 3 },
      { cx: 15.5, cy: 15.5, r: 3 },
      { cx: 12,   cy: 10,   r: 3 },
    ],
    paths: [
      'M8.5 12.5 L12 7 M15.5 12.5 L12 7 M12 7 L12 4.5',
    ],
  },

  // ── Ginger root ───────────────────────────────────────────────────────────
  // Irregular closed rhizome shape with two protruding side nubs
  'ginger-root': {
    viewBox: '0 0 24 24',
    style: 'stroke',
    paths: [
      'M5 15 C4 11 6 7 10 7 C10 4 14 3 16 6 C19 5 22 8 20 12 C22 14 20 19 16 18 C15 21 11 21 9 19 C7 20 4 18 5 15 Z',
      'M8 8 C6 6 3 7 4 10',
      'M16 7 C17 4 20 4 20 7',
    ],
  },

  // ── Resin / amber teardrop ────────────────────────────────────────────────
  // Lucide "droplet" (ISC licence)
  'resin-drop': {
    viewBox: '0 0 24 24',
    style: 'stroke',
    paths: [
      'M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z',
    ],
  },

  // ── Herb bundle / smudge stick ────────────────────────────────────────────
  // Three curved stems tied with two wrap bands + teardrop buds at tips
  'herb-bundle': {
    viewBox: '0 0 24 24',
    style: 'stroke',
    paths: [
      // three stems
      'M9 22 C9 18 8.5 13 9.5 5',
      'M12 22 C12 18 12 12 12 4',
      'M15 22 C15 18 15.5 13 14.5 5',
      // binding wraps
      'M8.5 19 C9.5 20.5 14.5 20.5 15.5 19',
      'M8.5 17.5 C9.5 19 14.5 19 15.5 17.5',
      // teardrop buds at tips
      'M9.5 5 C9 4 9 3 9.5 2.5 C10 3 10 4 9.5 5',
      'M12 4 C11.5 3 11.5 2 12 1.5 C12.5 2 12.5 3 12 4',
      'M14.5 5 C14 4 14 3 14.5 2.5 C15 3 15 4 14.5 5',
    ],
  },

  // ── Wood stick / palo santo log ───────────────────────────────────────────
  // Diagonal parallelogram log outline + two grain lines along the surface
  'wood-stick': {
    viewBox: '0 0 24 24',
    style: 'stroke',
    paths: [
      'M4 17 L18 3',
      'M7 21 L21 7',
      'M4 17 L7 21',
      'M18 3 L21 7',
      // grain lines
      'M6 18.5 L17 7.5',
      'M8.5 20 L19.5 9',
    ],
  },

};
