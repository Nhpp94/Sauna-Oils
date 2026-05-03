import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EssentialOil } from '../data/oils';
import { useRemoteData } from '../context/RemoteDataContext';
import { Colors, Typography, FontSize, Spacing, Radius } from '../constants/theme';
import { CATEGORY_META } from '../constants/categories';
import { VIBE_ICONS, VIBE_COLORS, TIME_ICONS, NOTE_ICONS } from '../constants/icons';
import { OilIcon } from './OilIcon';

interface Props {
  oil: EssentialOil | null;
  visible: boolean;
  onClose: () => void;
  owned?: boolean;
  onToggleOwned?: () => void;
}

const NOTE_FULL: Record<string, string> = {
  top: 'Top note — opens the session',
  middle: 'Heart note — carries the session',
  base: 'Base note — anchors the session',
};

const INTENSITY_TEXT: Record<number, string> = {
  1: 'Light — gentle, subtle presence',
  2: 'Medium — well balanced',
  3: 'Strong — use sparingly',
};

const TIME_LABELS: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

const VIBE_LABELS: Record<string, string> = {
  energizing: 'Energizing', relaxing: 'Relaxing', grounding: 'Grounding',
  meditative: 'Meditative', warming: 'Warming', awakening: 'Awakening',
  detox: 'Detox', creative: 'Creative', immune: 'Immune',
};

const VIBE_BG: Record<string, string> = {
  energizing:  'rgba(232,160,32,0.15)',
  relaxing:    'rgba(144,112,176,0.15)',
  grounding:   'rgba(90,128,64,0.15)',
  meditative:  'rgba(112,96,160,0.15)',
  warming:     'rgba(208,96,48,0.15)',
  awakening:   'rgba(48,168,192,0.15)',
  detox:       'rgba(96,160,64,0.15)',
  creative:    'rgba(192,96,160,0.15)',
  immune:      'rgba(192,64,48,0.15)',
};

export function OilDetailSheet({ oil, visible, onClose, owned, onToggleOwned }: Props) {
  const { oils } = useRemoteData();
  if (!oil) return null;
  const meta = CATEGORY_META[oil.category];
  const pairOils = oil.pairsWith.map(id => oils.find(o => o.id === id)).filter(Boolean) as EssentialOil[];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: oil.color + '60' }]}>
          <View style={[styles.colorStrip, { backgroundColor: oil.color }]} />
          <View style={styles.headerContent}>
            <OilIcon oil={oil} size={36} />
            <View style={styles.headerText}>
              <Text style={styles.name}>{oil.name}</Text>
              <Text style={styles.latin}>{oil.latinName}</Text>
            </View>
            <View style={styles.headerActions}>
              {onToggleOwned && (
                <TouchableOpacity onPress={onToggleOwned} style={styles.ownedBtn}>
                  <Ionicons
                    name={owned ? 'checkmark-circle' : 'add-circle-outline'}
                    size={14}
                    color={owned ? Colors.gold : Colors.textSecondary}
                  />
                  <Text style={[styles.ownedBtnText, owned && styles.ownedBtnActive]}>
                    {owned ? 'In My Kit' : 'Add to Kit'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Meta tags */}
          <View style={styles.metaRow}>
            <View style={[styles.metaTag, { backgroundColor: meta.color + '25', borderColor: meta.color + '50' }]}>
              <Ionicons name={meta.icon as any} size={13} color={meta.color} />
              <Text style={[styles.metaTagText, { color: meta.color }]}>{meta.label}</Text>
            </View>
            <View style={styles.metaTag}>
              <Ionicons name={NOTE_ICONS[oil.note] as any} size={13} color={Colors.textSecondary} />
              <Text style={styles.metaTagText}>{NOTE_FULL[oil.note]}</Text>
            </View>
            <View style={styles.metaTag}>
              <Ionicons name="speedometer-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.metaTagText}>{INTENSITY_TEXT[oil.intensity]}</Text>
            </View>
          </View>

          {/* Body Impact */}
          <Section title="Body & Mind Impact">
            <Text style={styles.bodyText}>{oil.bodyImpact}</Text>
          </Section>

          {/* Sauna Note */}
          <Section title="In the Sauna">
            <View style={styles.saunaNoteBox}>
              <Ionicons name="thermometer-outline" size={20} color={Colors.gold} style={{ marginTop: 2 }} />
              <Text style={styles.saunaNoteText}>{oil.saunaNote}</Text>
            </View>
          </Section>

          {/* Benefits */}
          <Section title="Key Benefits">
            <View style={styles.benefitsGrid}>
              {oil.benefits.map(b => (
                <View key={b} style={styles.benefitTag}>
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
            </View>
          </Section>

          {/* Vibes & Times */}
          <Section title="Best For">
            <View style={styles.vibeRow}>
              {oil.vibes.map(v => (
                <View key={v} style={[styles.vibeTag, { backgroundColor: VIBE_BG[v] ?? 'rgba(255,255,255,0.06)' }]}>
                  <Ionicons name={VIBE_ICONS[v] as any} size={11} color={VIBE_COLORS[v] ?? Colors.textSecondary} />
                  <Text style={styles.vibeText}>{VIBE_LABELS[v] ?? v}</Text>
                </View>
              ))}
              {oil.timeOfDay.map(t => (
                <View key={t} style={styles.timeTag}>
                  <Ionicons name={TIME_ICONS[t] as any} size={11} color="rgba(48,128,176,0.9)" />
                  <Text style={styles.vibeText}>{TIME_LABELS[t]}</Text>
                </View>
              ))}
            </View>
          </Section>

          {/* Pairings */}
          {pairOils.length > 0 && (
            <Section title="Pairs Beautifully With">
              <View style={styles.pairingsRow}>
                {pairOils.map(pair => (
                  <View key={pair.id} style={[styles.pairTag, { borderColor: pair.color + '60' }]}>
                    <OilIcon oil={pair} size={14} />
                    <Text style={styles.pairName}>{pair.name}</Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.md,
    color: Colors.gold,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  colorStrip: {
    height: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xxl,
    color: Colors.textPrimary,
  },
  latin: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  ownedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ownedBtnText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  ownedBtnActive: {
    color: Colors.gold,
  },
  scroll: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  metaRow: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  metaTagText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  bodyText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.md,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  saunaNoteBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: 'rgba(212,151,58,0.08)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: Colors.gold,
  },
  saunaNoteText: {
    flex: 1,
    fontFamily: Typography.sans,
    fontSize: FontSize.md,
    lineHeight: 22,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  benefitTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(90,128,64,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(90,128,64,0.4)',
  },
  benefitText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: '#7ab060',
  },
  vibeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  vibeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(48,128,176,0.15)',
  },
  vibeText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  pairingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pairTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
  },
  pairName: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
