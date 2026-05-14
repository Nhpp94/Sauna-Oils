import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Blend } from '../data/blends';
import { useRemoteData } from '../context/RemoteDataContext';
import { Colors, Typography, FontSize, Spacing, Radius } from '../constants/theme';
import { CATEGORY_META } from '../constants/categories';
import { VIBE_ICONS, VIBE_COLORS, TIME_ICONS } from '../constants/icons';
import { BotanicalIcon } from './BotanicalIcon';
import { OIL_ICONS } from '../constants/oilIcons';

function blendBotanical(blend: Blend): string {
  if (blend.id.startsWith('custom_blend_') || blend.id.startsWith('studio_custom_blend_')) return 'star';
  return OIL_ICONS[blend.oils[0]?.id]?.botanical ?? 'sprout';
}

interface Props {
  blend: Blend;
  onPress: () => void;
}

export function BlendCard({ blend, onPress }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { oils } = useRemoteData();

  return (
    <View style={styles.card}>
      <View style={[styles.colorBar, { backgroundColor: Colors.gold }]} />
      <View style={styles.inner}>

        {/* Header — tap to expand/collapse */}
        <TouchableOpacity
          style={styles.header}
          onPress={() => setExpanded(v => !v)}
          activeOpacity={0.75}
        >
          <BotanicalIcon botanicalKey={blendBotanical(blend)} size={42} color="rgba(255,255,255,0.85)" />
          <View style={styles.headerText}>
            <Text style={styles.name}>{blend.name}</Text>
            <View style={styles.tagRow}>
              {blend.vibes.slice(0, 2).map(v => (
                <Ionicons key={v} name={VIBE_ICONS[v] as any} size={13} color={VIBE_COLORS[v] ?? Colors.textMuted} />
              ))}
              {blend.timeOfDay.map(t => (
                <Ionicons key={t} name={TIME_ICONS[t] as any} size={13} color="rgba(48,128,176,0.8)" />
              ))}
            </View>
            {/* Oil chips — always visible */}
            <View style={styles.oilsRow}>
              {blend.oils.map((o, i) => {
                const oilData = oils.find(oil => oil.id === o.id);
                const chipColor = oilData ? CATEGORY_META[oilData.category].color : blend.color;
                return (
                  <React.Fragment key={o.id}>
                    {i > 0 && <Text style={styles.plus}>+</Text>}
                    <View style={[styles.oilChip, { borderColor: chipColor + '40' }]}>
                      <Text style={[styles.oilChipText, { color: chipColor }]}>{o.name}</Text>
                    </View>
                  </React.Fragment>
                );
              })}
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.textMuted}
            style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }], marginTop: 2 }}
          />
        </TouchableOpacity>

        {/* Expanded content */}
        {expanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.description}>{blend.description}</Text>

            <View style={styles.benefitsRow}>
              {blend.benefits.slice(0, 4).map(b => (
                <View key={b} style={styles.benefitChip}>
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
            </View>

            <View style={styles.detailsRow}>
              <TouchableOpacity style={styles.detailsBtn} onPress={onPress} activeOpacity={0.75}>
                <Text style={styles.detailsBtnText}>Details</Text>
                <Ionicons name="chevron-forward" size={12} color={Colors.gold} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!expanded && <View style={{ height: Spacing.sm }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  colorBar: { height: 3 },
  inner: {
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: 0,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  oilsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  plus: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  oilChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
  },
  oilChipText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.xs,
  },
  expandedContent: {
    gap: Spacing.sm,
  },
  description: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  benefitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  benefitChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  benefitText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  detailsRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailsBtnText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.gold,
  },
});
