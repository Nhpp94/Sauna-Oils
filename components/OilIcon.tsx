import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EssentialOil } from '../data/oils';
import { OIL_ICONS } from '../constants/oilIcons';
import { IconBadge } from './IconBadge';
import { BotanicalIcon } from './BotanicalIcon';

interface Props {
  oil: EssentialOil;
  size: number;
  color?: string;
  badge?: boolean;
}

export function OilIcon({ oil, size, color, badge }: Props) {
  const iconDef = oil.id.startsWith('custom_') ? null : OIL_ICONS[oil.id];

  if (badge) {
    const botanicalKey = iconDef?.botanical ?? 'star';
    const bgColor = iconDef?.color ?? oil.color ?? '#607050';
    return <IconBadge botanicalKey={botanicalKey} bgColor={bgColor} size={size} />;
  }

  if (!iconDef) {
    return (
      <BotanicalIcon
        botanicalKey="star"
        size={size}
        color={color ?? 'rgba(255,255,255,0.85)'}
      />
    );
  }

  // Non-badge: show plain botanical SVG for standard oils
  return (
    <BotanicalIcon
      botanicalKey={iconDef.botanical}
      size={size}
      color={color ?? 'rgba(255,255,255,0.85)'}
    />
  );
}
