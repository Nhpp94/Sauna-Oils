import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Pressable,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMyIncense } from '../../hooks/useMyIncense';
import { useRemoteData } from '../../context/RemoteDataContext';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import { FORM_META, IncenseForm } from '../../constants/incenseForms';
import { VIBE_ICONS, VIBE_COLORS, TIME_ICONS } from '../../constants/icons';
import { BotanicalIcon } from '../../components/BotanicalIcon';

const INCENSE_BOTANICALS: Record<string, string> = {
  'palo-santo': 'wood-stick', 'white-sage': 'herb-bundle',
  'frankincense-resin': 'resin-drop', 'myrrh-resin': 'resin-drop',
  'copal-resin': 'resin-drop', 'cedar-chips': 'pine-branch',
  'mugwort': 'herb-bundle', 'dragons-blood': 'resin-drop',
  'benzoin-resin': 'resin-drop', 'sandalwood-chips': 'sandalwood-ring',
  'chamomile-flowers': 'chamomile',
};
const INCENSE_FORM_BOTANICALS: Record<string, string> = {
  wood: 'wood-stick', resin: 'resin-drop', herb: 'herb-bundle',
  stick: 'lavender-sprig', cone: 'lavender-sprig',
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
const TIME_LABELS: Record<string, string> = {
  morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening',
};
const FORM_LABEL: Record<string, string> = {
  wood: 'Wood', resin: 'Resin', herb: 'Herb', stick: 'Stick', cone: 'Cone',
};

export default function IncenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ownedIncenseIds, toggleOwnedIncense } = useMyIncense();
  const { incense: allIncense } = useRemoteData();

  const incense = allIncense.find(i => i.id === id);

  if (!incense) {
    return (
      <View style={[styles.gradient, { backgroundColor: Colors.bg, flex: 1 }]}>
        <View style={[styles.screenHeader, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color="#f0e4c8" />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Incense not found</Text>
        </View>
      </View>
    );
  }

  const owned = ownedIncenseIds.has(incense.id);
  const botanicalKey = INCENSE_BOTANICALS[incense.id] ?? INCENSE_FORM_BOTANICALS[incense.form] ?? 'resin-drop';

  return (
    <View style={[styles.gradient, { backgroundColor: Colors.bg }]}>
      <View style={[styles.screenHeader, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#f0e4c8" />
        </Pressable>
        <Text style={styles.screenTitle} numberOfLines={1}>{incense.name}</Text>
        <TouchableOpacity onPress={() => toggleOwnedIncense(incense.id)} style={styles.headerRight}>
          <Ionicons name={owned ? 'checkmark-circle' : 'add-circle-outline'} size={22} color={owned ? Colors.gold : Colors.textPrimary} />
        </TouchableOpacity>
      </View>
      <View style={[styles.colorBar, { backgroundColor: incense.color }]} />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={{ marginBottom: Spacing.md }}>
              <BotanicalIcon botanicalKey={botanicalKey} size={56} color="rgba(255,255,255,0.85)" />
            </View>
            <Text style={styles.heroName}>{incense.name}</Text>
            {incense.latinName && (
              <Text style={styles.heroLatin}>{incense.latinName}</Text>
            )}
            <Text style={styles.heroMeta}>{FORM_LABEL[incense.form]} · {incense.origin}</Text>
            <TouchableOpacity
              style={[styles.kitBadge, owned ? styles.kitBadgeOwned : styles.kitBadgeMissing]}
              onPress={() => toggleOwnedIncense(incense.id)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={owned ? 'checkmark-circle' : 'add-circle-outline'}
                size={13}
                color={owned ? Colors.gold : Colors.textMuted}
              />
              <Text style={[styles.kitBadgeText, owned ? { color: Colors.gold } : { color: Colors.textMuted }]}>
                {owned ? 'In my kit' : 'Add to kit'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Section title="About">
            <Text style={styles.bodyText}>{incense.description}</Text>
          </Section>

          {/* Sauna Note */}
          <Section title="In the Sauna">
            <View style={styles.saunaNoteBox}>
              <Ionicons name="flame-outline" size={20} color={incense.color} style={{ marginTop: 2 }} />
              <Text style={styles.saunaNoteText}>{incense.saunaNote}</Text>
            </View>
          </Section>

          {/* Benefits */}
          <Section title="Key Benefits">
            <View style={styles.tagsWrap}>
              {incense.benefits.map(b => (
                <View key={b} style={styles.benefitTag}>
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
            </View>
          </Section>

          {/* Best For */}
          <Section title="Best For">
            <View style={styles.tagsWrap}>
              {incense.vibes.map(v => (
                <View key={v} style={[styles.vibeTag, { backgroundColor: VIBE_BG[v] ?? 'rgba(255,255,255,0.06)' }]}>
                  <Ionicons name={VIBE_ICONS[v] as any} size={11} color={VIBE_COLORS[v] ?? Colors.textSecondary} />
                  <Text style={styles.vibeTagText}>{VIBE_LABELS[v] ?? v}</Text>
                </View>
              ))}
              {incense.timeOfDay.map(t => (
                <View key={t} style={styles.timeTag}>
                  <Ionicons name={TIME_ICONS[t] as any} size={11} color="rgba(48,128,176,0.9)" />
                  <Text style={styles.vibeTagText}>{TIME_LABELS[t]}</Text>
                </View>
              ))}
            </View>
          </Section>

          {/* Precautions */}
          {incense.precautions.length > 0 && (
            <Section title="Precautions">
              <View style={styles.tagsWrap}>
                {incense.precautions.map(p => (
                  <View key={p} style={styles.precautionTag}>
                    <Ionicons name="warning-outline" size={11} color="#c87020" />
                    <Text style={styles.precautionText}>{p}</Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
    </View>
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
  container: { marginBottom: Spacing.xl },
  title: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.sm,
    color: Colors.gold,
    marginBottom: Spacing.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  screenHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 4 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  screenTitle: { flex: 1, textAlign: 'center', fontFamily: Typography.serifBold, fontSize: FontSize.xl, color: '#f0e4c8' },
  headerRight: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  notFound: {
    flex: 1, backgroundColor: Colors.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: Typography.sans, color: Colors.textSecondary, fontSize: FontSize.lg,
  },
  colorBar: { height: 4 },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  heroName: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.display,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  heroLatin: {
    fontFamily: Typography.sans,
    fontSize: FontSize.md,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  heroMeta: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  kitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  kitBadgeOwned: {
    borderColor: Colors.goldDim,
    backgroundColor: Colors.goldDim,
  },
  kitBadgeMissing: {
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  kitBadgeText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.xs,
  },
  bodyText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.md,
    lineHeight: 26,
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
  tagsWrap: {
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
  vibeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
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
  vibeTagText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  precautionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(200,112,32,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(200,112,32,0.3)',
  },
  precautionText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: '#c87020',
  },
});
