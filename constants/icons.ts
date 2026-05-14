// Centralised Ionicons name mappings used across the app

export const VIBE_META = [
  { value: 'energizing',  label: 'Energizing',  desc: 'Awaken & activate', icon: 'flash-outline',       color: '#e8a020' },
  { value: 'relaxing',    label: 'Relaxing',    desc: 'Release & restore', icon: 'moon-outline',        color: '#9070b0' },
  { value: 'grounding',   label: 'Grounding',   desc: 'Root & centre',     icon: 'earth-outline',       color: '#5a8040' },
  { value: 'meditative',  label: 'Meditative',  desc: 'Still & inward',    icon: 'eye-outline',         color: '#7060a0' },
  { value: 'warming',     label: 'Warming',     desc: 'Kindle & heat',     icon: 'flame-outline',       color: '#d06030' },
  { value: 'awakening',   label: 'Awakening',   desc: 'Sharp & clear',     icon: 'sunny-outline',       color: '#30a8c0' },
  { value: 'detox',       label: 'Detox',       desc: 'Cleanse & purge',   icon: 'filter-outline',      color: '#60a040' },
  { value: 'creative',    label: 'Creative',    desc: 'Inspire & open',    icon: 'color-wand-outline',  color: '#c060a0' },
  { value: 'immune',      label: 'Immune',      desc: 'Fortify & defend',  icon: 'shield-outline',      color: '#c04030' },
] as const;

export const VIBE_ICONS: Record<string, string> = Object.fromEntries(
  VIBE_META.map(vibe => [vibe.value, vibe.icon])
);

export const TIME_ICONS: Record<string, string> = {
  morning:   'sunny-outline',
  afternoon: 'partly-sunny-outline',
  evening:   'cloudy-night-outline',
};

export const NOTE_ICONS: Record<string, string> = {
  top:    'arrow-up-circle-outline',
  middle: 'radio-button-on-outline',
  base:   'layers-outline',
};

export const VIBE_COLORS: Record<string, string> = Object.fromEntries(
  VIBE_META.map(vibe => [vibe.value, vibe.color])
);
