import { Colors } from './theme';

export type Category = 'citrus' | 'floral' | 'woody' | 'herbal' | 'spicy' | 'resinous' | 'minty' | 'aquatic';

export const CATEGORY_META: Record<Category, { label: string; color: string; icon: string }> = {
  citrus:   { label: 'Citrus',   color: Colors.citrus,   icon: 'sunny-outline' },
  floral:   { label: 'Floral',   color: Colors.floral,   icon: 'rose-outline' },
  woody:    { label: 'Woody',    color: Colors.woody,    icon: 'leaf-outline' },
  herbal:   { label: 'Herbal',   color: Colors.herbal,   icon: 'flower-outline' },
  spicy:    { label: 'Spicy',    color: Colors.spicy,    icon: 'flame-outline' },
  resinous: { label: 'Resinous', color: Colors.resinous, icon: 'flask-outline' },
  minty:    { label: 'Minty',    color: Colors.minty,    icon: 'snow-outline' },
  aquatic:  { label: 'Aquatic',  color: Colors.aquatic,  icon: 'water-outline' },
};

export const ALL_CATEGORIES: Category[] = [
  'citrus', 'floral', 'woody', 'herbal', 'spicy', 'resinous', 'minty', 'aquatic',
];
