import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Incense } from '../data/incense';
import { Colors, Typography, FontSize, Spacing, Radius } from '../constants/theme';
import { VIBE_ICONS, VIBE_COLORS, TIME_ICONS } from '../constants/icons';
import { BotanicalIcon } from './BotanicalIcon';
import { FORM_META, IncenseForm } from '../constants/incenseForms';

const INCENSE_FORM_BOTANICALS: Record<string, string> = {
  wood:  'wood-stick',
  resin: 'resin-drop',
  herb:  'herb-bundle',
  stick: 'lavender-sprig',
  cone:  'lavender-sprig',
};

const INCENSE_BOTANICALS: Record<string, string> = {
  'palo-santo':         'wood-stick',
  'white-sage':         'herb-bundle',
  'frankincense-resin': 'resin-drop',
  'myrrh-resin':        'resin-drop',
  'copal-resin':        'resin-drop',
  'cedar-chips':        'pine-branch',
  'mugwort':            'herb-bundle',
  'dragons-blood':      'resin-drop',
  'benzoin-resin':      'resin-drop',
  'sandalwood-chips':   'sandalwood-ring',
  'chamomile-flowers':  'chamomile',
};

const FORM_LABEL: Record<string, string> = {
  wood: 'Wood', resin: 'Resin', herb: 'Herb Bundle', stick: 'Stick', cone: 'Cone',
};

interface Props {
  incense: Incense;
  onPress?: () => void;
  owned?: boolean;
  onToggleOwned?: () => void;
}

export function IncenseCard({ incense, onPress, owned = false, onToggleOwned }: Props) {
  const [expanded, setExpanded] = useState(false);
  const botanicalKey = INCENSE_BOTANICALS[incense.id] ?? INCENSE_FORM_BOTANICALS[incense.form] ?? 'resin-drop';
  const formMeta = FORM_META[incense.form as IncenseForm];

  return (
    <View style={styles.card}>
      <View style={[styles.colorBar, { backgroundColor: formMeta.color }]} />
      <View style={styles.inner}>

        {/* Header — tap to expand/collapse */}
        <TouchableOpacity
          style={styles.header}
          onPress={() => setExpanded(v => !v)}
          activeOpacity={0.75}
        >
          <BotanicalIcon botanicalKey={botanicalKey} size={42} color="rgba(255,255,255,0.85)" />
          <View style={styles.headerText}>
            <Text style={styles.name}>{incense.name}</Text>
            {incense.latinName && (
              <Text style={styles.latinName}>{incense.latinName}</Text>
            )}
            <View style={styles.tagRow}>
              <View style={[styles.formTag, { borderColor: formMeta.color + '40' }]}>
                <Ionicons name="flame-outline" size={10} color={formMeta.color} />
                <Text style={[styles.formTagText, { color: formMeta.color }]}>{FORM_LABEL[incense.form]}</Text>
              </View>
              <Text style={styles.origin}>{incense.origin}</Text>
              {incense.vibes.slice(0, 2).map(v => (
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
            <Text style={styles.description}>{incense.description}</Text>

            <View style={[styles.saunaNoteBox, { borderLeftColor: incense.color + '80' }]}>
              <Text style={styles.saunaNoteLabel}>In the sauna</Text>
              <Text style={styles.saunaNote}>{incense.saunaNote}</Text>
            </View>

            <View style={styles.benefitsRow}>
              {incense.benefits.slice(0, 4).map(b => (
                <View key={b} style={[styles.benefitChip, { backgroundColor: incense.color + '18' }]}>
                  <Text style={[styles.benefitText, { color: incense.color }]}>{b}</Text>
                </View>
              ))}
            </View>

            {onPress && (
              <View style={styles.detailsRow}>
                <TouchableOpacity style={styles.detailsBtn} onPress={onPress} activeOpacity={0.75}>
                  <Text style={styles.detailsBtnText}>Details</Text>
                  <Ionicons name="chevron-forward" size={12} color={Colors.gold} />
                </TouchableOpacity>
              </View>
            )}
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
        {onToggleOwned === undefined && !expanded && <View style={{ height: Spacing.sm }} />}
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
  formTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
  },
  formTagText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xxs,
  },
  origin: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
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
  saunaNoteBox: {
    borderLeftWidth: 2,
    paddingLeft: Spacing.sm,
  },
  saunaNoteLabel: {
    fontFamily: Typography.sansBold,
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  saunaNote: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
    fontStyle: 'italic',
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
  },
  benefitText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
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
