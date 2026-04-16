import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EssentialOil, Vibe, TimeOfDay } from '../data/oils';
import { SessionSlot } from '../data/recommendations';
import { Blend } from '../data/blends';
import { Colors, Typography, FontSize, Spacing, Radius } from '../constants/theme';
import { CATEGORY_META } from '../constants/categories';
import { NOTE_ICONS } from '../constants/icons';
import { OilIcon } from './OilIcon';
import { BotanicalIcon } from './BotanicalIcon';
import { OIL_ICONS } from '../constants/oilIcons';

interface Props {
  slots: SessionSlot[];
  narrative: string;
  vibe: Vibe;
  time: TimeOfDay;
  ownedIds: Set<string>;
  onOilPress: (oil: EssentialOil) => void;
  onSwapPress: (slotIndex: number, oil: EssentialOil | null) => void;
  onBlendPress: (blend: Blend) => void;
}

const NOTE_LABEL: Record<string, string> = {
  top: 'Top note',
  middle: 'Heart note',
  base: 'Base note',
};

export function TrioResult({ slots, narrative, vibe, time, ownedIds, onOilPress, onSwapPress, onBlendPress }: Props) {
  return (
    <View style={styles.container}>
      {/* Slots */}
      {slots.map((slot, index) => {
        if (slot.kind === 'blend') {
          const { blend } = slot;
          const botanicalKey = OIL_ICONS[blend.oils[0]?.id]?.botanical ?? 'sprout';
          return (
            <TouchableOpacity
              key={`blend-${blend.id}`}
              style={[styles.oilCard, { borderTopColor: Colors.gold }]}
              onPress={() => onBlendPress(blend)}
              activeOpacity={0.85}
            >
              <View style={[styles.oilColorBar, { backgroundColor: Colors.gold }]} />
              <View style={styles.oilCardInner}>
                {/* Header */}
                <View style={styles.oilMainRow}>
                  <View style={styles.oilIndexBadge}>
                    <Text style={styles.oilIndex}>{index + 1}</Text>
                  </View>
                  <BotanicalIcon botanicalKey={botanicalKey} size={32} color="rgba(255,255,255,0.85)" />
                  <View style={styles.oilNames}>
                    <View style={styles.blendLabelRow}>
                      <Text style={styles.blendTypeLabel}>BLEND</Text>
                    </View>
                    <Text style={styles.oilName}>{blend.name}</Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.oilImpact} numberOfLines={2}>{blend.description}</Text>

                {/* Oils within the blend */}
                <View style={styles.blendOilsRow}>
                  {blend.oils.map((bo, i) => (
                    <React.Fragment key={bo.id}>
                      {i > 0 && <Text style={styles.blendOilDot}>·</Text>}
                      <Text style={styles.blendOilName}>{bo.name}</Text>
                    </React.Fragment>
                  ))}
                </View>

                {/* Benefits */}
                <View style={styles.benefitsRow}>
                  {blend.benefits.slice(0, 3).map(b => (
                    <View key={b} style={styles.benefitChip}>
                      <Text style={styles.benefitText}>{b}</Text>
                    </View>
                  ))}
                </View>

                {/* Footer */}
                {(() => {
                  const ownedCount = blend.oils.filter(bo => ownedIds.has(bo.id)).length;
                  const blendOwned = ownedCount === blend.oils.length;
                  return (
                    <View style={styles.oilFooter}>
                      <View style={styles.ownedStatus}>
                        <Ionicons
                          name={blendOwned ? 'checkmark-circle' : 'close-circle-outline'}
                          size={14}
                          color={blendOwned ? Colors.gold : Colors.textMuted}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.ownedStatusText, blendOwned ? { color: Colors.gold } : { color: Colors.textMuted }]}>
                          {blendOwned ? 'All in kit' : `${ownedCount}/${blend.oils.length} in kit`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.swapBtn}
                        onPress={() => onSwapPress(index, null)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="swap-horizontal-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.swapBtnText}>Swap</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.detailBtn} onPress={() => onBlendPress(blend)}>
                        <Text style={styles.detailBtnText}>Details</Text>
                        <Ionicons name="chevron-forward" size={12} color={Colors.gold} />
                      </TouchableOpacity>
                    </View>
                  );
                })()}
              </View>
            </TouchableOpacity>
          );
        }

        // Oil slot
        const { oil } = slot;
        const meta = CATEGORY_META[oil.category];
        const owned = ownedIds.has(oil.id);
        return (
          <TouchableOpacity
            key={oil.id}
            style={[styles.oilCard, { borderTopColor: meta.color }]}
            onPress={() => onOilPress(oil)}
            activeOpacity={0.85}
          >
            <View style={[styles.oilColorBar, { backgroundColor: meta.color }]} />

            <View style={styles.oilCardInner}>
              <View style={styles.oilMainRow}>
                <View style={styles.oilIndexBadge}>
                  <Text style={styles.oilIndex}>{index + 1}</Text>
                </View>
                <OilIcon oil={oil} size={32} />
                <View style={styles.oilNames}>
                  <Text style={styles.oilName}>{oil.name}</Text>
                  <Text style={styles.oilLatin}>{oil.latinName}</Text>
                </View>
                <View style={styles.oilNoteTag}>
                  <Ionicons name={NOTE_ICONS[oil.note] as any} size={16} color={Colors.textMuted} />
                  <Text style={styles.oilNoteLabel}>{NOTE_LABEL[oil.note]}</Text>
                </View>
              </View>

              <Text style={styles.oilImpact} numberOfLines={2}>{oil.bodyImpact}</Text>

              <View style={styles.benefitsRow}>
                {oil.benefits.slice(0, 3).map(b => (
                  <View key={b} style={styles.benefitChip}>
                    <Text style={styles.benefitText}>{b}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.oilFooter}>
                <View style={styles.ownedStatus}>
                  <Ionicons
                    name={owned ? 'checkmark-circle' : 'close-circle-outline'}
                    size={14}
                    color={owned ? Colors.gold : Colors.textMuted}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.ownedStatusText, owned ? { color: Colors.gold } : { color: Colors.textMuted }]}>
                    {owned ? 'In my kit' : 'Not in kit'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.swapBtn}
                  onPress={() => onSwapPress(index, oil)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="swap-horizontal-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.swapBtnText}>Swap</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.detailBtn} onPress={() => onOilPress(oil)}>
                  <Text style={styles.detailBtnText}>Details</Text>
                  <Ionicons name="chevron-forward" size={12} color={Colors.gold} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  oilCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  oilColorBar: {
    height: 3,
  },
  oilCardInner: {
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: 0,
    gap: Spacing.sm,
  },
  oilMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  oilIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oilIndex: {
    fontFamily: Typography.sansBold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  oilNames: {
    flex: 1,
  },
  oilName: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  oilLatin: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  oilNoteTag: {
    alignItems: 'center',
    gap: 2,
  },
  oilNoteLabel: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  oilImpact: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  blendLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  blendTypeLabel: {
    fontFamily: Typography.sansBold,
    fontSize: FontSize.xxs,
    color: Colors.gold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  blendOilsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  blendOilName: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  blendOilDot: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  benefitsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
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
  oilFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ownedStatus: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  ownedStatusText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
  },
  swapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  swapBtnText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  detailBtnText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.gold,
  },
});
