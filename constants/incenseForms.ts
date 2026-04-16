export type IncenseForm = 'resin' | 'wood' | 'herb' | 'stick' | 'cone';

export const FORM_META: Record<IncenseForm, { label: string; color: string; icon: string }> = {
  resin: { label: 'Resin',       color: '#c09050', icon: 'flask-outline' },
  wood:  { label: 'Wood',        color: '#8b5a30', icon: 'leaf-outline' },
  herb:  { label: 'Herb Bundle', color: '#6a8a50', icon: 'flower-outline' },
  stick: { label: 'Stick',       color: '#9a6080', icon: 'flame-outline' },
  cone:  { label: 'Cone',        color: '#7a6050', icon: 'flame-outline' },
};
