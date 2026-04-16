import React from 'react';
import { View } from 'react-native';
import { BotanicalIcon } from './BotanicalIcon';

interface Props {
  botanicalKey: string;
  bgColor: string;
  size: number;
}

export function IconBadge({ botanicalKey, bgColor, size }: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <BotanicalIcon botanicalKey={botanicalKey} size={size * 0.6} color="#fff" />
    </View>
  );
}
