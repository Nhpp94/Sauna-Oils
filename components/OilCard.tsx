import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EssentialOil } from '../data/oils';
import { Colors, Typography, FontSize, Spacing, Radius } from '../constants/theme';
import { CATEGORY_META } from '../constants/categories';
import { VIBE_ICONS, VIBE_COLORS } from '../constants/icons';
import { OilIcon } from './OilIcon';

const NOTE_LABEL: Record<string, string> = {
  top: 'Top note', middle: 'Middle note', base: 'Base note',
};

interface Props {
  oil: EssentialOil;
  onPress: () => void;
  owned?: boolean;
  onToggleOwned?: () => void;
}

export function OilCard({ oil, onPress, owned = false, onToggleOwned }: Props) {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[oil.category];

  return (
    <View style={styles.card}>
      <View style={[styles.colorBar, { backgroundColor: meta.color }]} />
      <View style={styles.inner}>

        {/* Header — tap to expand/collapse */}
        <TouchableOpacity
          style={styles.header}
          onPress={() => setExpanded(v => !v)}
          activeOpacity={0.75}
        >
          <OilIcon oil={oil} size={42} />
          <View style={styles.headerText}>
            <Text style={styles.name}>{oil.name}</Text>
            <Text style={styles.latinName}>{oil.latinName}</Text>
            <View style={styles.tagRow}>
              <Text style={[styles.categoryTag, { color: meta.color }]}>{meta.label}</Text>
              <View style={styles.notePill}>
                <Text style={styles.notePillText}>{NOTE_LABEL[oil.note]}</Text>
              </View>
              {oil.vibes.slice(0, 2).map(v => (
                <Ionicons key={v} name={VIBE_ICONS[v] as any} size={12} color={VIBE_COLORS[v] ?? Colors.textMuted} />
              ))}
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
            <Text style={styles.description}>{oil.bodyImpact}</Text>

            <View style={styles.benefitsRow}>
              {oil.benefits.slice(0, 4).map(b => (
                <View key={b} style={styles.benefitChip}>
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.detailsBtn} onPress={onPress} activeOpacity={0.75}>
              <Text style={styles.detailsBtnText}>Details</Text>
              <Ionicons name="chevron-forward" size={12} color={Colors.gold} />
            </TouchableOpacity>
          </View>
        )}

        {/* Kit footer — always visible */}
        {onToggleOwned !== undefined && (
          <View style={styles.footer}>
            <View style={styles.ownedStatus}>
              <Ionicons
                name={owned ? 'checkmark-circle' : 'close-circle-outline'}
                size={14}
                color={owned ? Colors.gold : Colors.textMuted}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.ownedText, { color: owned ? Colors.gold : Colors.textMuted }]}>
                {owned ? 'In my kit' : 'Not in kit'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onToggleOwned}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.kitToggle, owned && styles.kitToggleActive]}
            >
              <Ionicons name={owned ? 'checkmark' : 'add'} size={16} color={owned ? Colors.gold : Colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
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
    gap: 3,
  },
  name: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  latinName: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  categoryTag: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.xs,
  },
  notePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  notePillText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
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
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-end',
    paddingVertical: Spacing.xs,
  },
  detailsBtnText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.gold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ownedStatus: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownedText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
  },
  kitToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kitToggleActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldDim,
  },
});
