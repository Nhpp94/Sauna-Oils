export const Colors = {
  // Backgrounds
  bg: '#0a0704',
  bgCard: 'rgba(234,226,205,0.05)',
  bgCardHover: 'rgba(234,226,205,0.09)',
  bgOverlay: 'rgba(0,0,0,0.7)',

  // Gradients
  gradientDark: ['#140d04', '#0a0704'] as const,
  gradientWarm: ['#2e1a06', '#180c03'] as const,
  gradientCard: ['rgba(234,226,205,0.07)', 'rgba(234,226,205,0.02)'] as const,

  // Primary accents
  gold: '#EAE2CD',
  goldLight: '#F5F0E8',
  goldDim: 'rgba(234,226,205,0.15)',

  // Category colors
  citrus: '#e8a020',
  floral: '#d4607a',
  woody: '#8b6040',
  herbal: '#5a8040',
  spicy: '#c04030',
  resinous: '#7a5030',
  minty: '#30a080',
  aquatic: '#3080b0',

  // Text
  textPrimary: '#f0e4c8',
  textSecondary: 'rgba(240,228,200,0.6)',
  textMuted: 'rgba(240,228,200,0.35)',

  // UI
  border: 'rgba(234,226,205,0.12)',
  borderSubtle: 'rgba(234,226,205,0.08)',
  borderGold: 'rgba(234,226,205,0.35)',
  success: '#5a8040',
  iconOnAccent: 'rgba(245,240,232,0.9)',
  errorBg: 'rgba(192,64,48,0.1)',
  errorBorder: 'rgba(192,64,48,0.3)',
  errorText: '#c04030',
  tabBar: '#0d0904',
} as const;

export const Typography = {
  serif:       'Inter_400Regular',
  serifBold:   'Inter_700Bold',
  serifItalic: 'Inter_600SemiBold',
  sans:        'IBMPlexSans_400Regular',
  sansMedium:  'IBMPlexSans_500Medium',
  sansBold:    'IBMPlexSans_600SemiBold',
} as const;

export const FontSize = {
  xxs:     10,  // smallest labels, sauna note tags
  xs:      12,  // chips, fine print, captions
  sm:      13,  // secondary body, small descriptions
  md:      15,  // primary body text
  lg:      17,  // large body, subtle section heads
  xl:      20,  // card titles, tab items
  xxl:     24,  // modal titles, page headers
  display: 30,  // detail page hero
  hero:    38,  // home screen hero
} as const;

export const LetterSpacing = {
  tight:  -0.3,
  normal:  0,
  wide:    1,
  wider:   2,
  label:   3,  // all-caps small labels
} as const;

export const LineHeight = {
  tight:  1.2,
  normal: 1.5,
  loose:  1.75,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;
