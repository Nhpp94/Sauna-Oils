import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { BOTANICAL_PATHS } from '../constants/botanicalPaths';

interface Props {
  botanicalKey: string;
  size: number;
  color?: string;
}

export function BotanicalIcon({ botanicalKey, size, color = '#fff' }: Props) {
  const p = BOTANICAL_PATHS[botanicalKey];
  if (!p) return null;

  if (p.style === 'fill') {
    return (
      <Svg width={size} height={size} viewBox={p.viewBox}>
        {p.paths.map((d, i) => (
          <Path key={i} d={d} fill={color} />
        ))}
      </Svg>
    );
  }

  // stroke style
  return (
    <Svg width={size} height={size} viewBox={p.viewBox}>
      {p.paths.map((d, i) => (
        <Path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={0.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {p.circles?.map((c, i) => (
        <Circle
          key={i}
          cx={c.cx}
          cy={c.cy}
          r={c.r}
          fill="none"
          stroke={color}
          strokeWidth={0.75}
        />
      ))}
    </Svg>
  );
}
