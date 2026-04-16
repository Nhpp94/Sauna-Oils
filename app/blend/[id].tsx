import React from 'react';
import {
  View, Text, ScrollView, Pressable,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BLENDS } from '../../data/blends';
import { useCustomLibrary } from '../../context/CustomLibraryContext';
import { useMyOils } from '../../hooks/useMyOils';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import { VIBE_ICONS, VIBE_COLORS, TIME_ICONS } from '../../constants/icons';
import { BotanicalIcon } from '../../components/BotanicalIcon';
import { OIL_ICONS } from '../../constants/oilIcons';

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

export default function BlendDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { customBlends } = useCustomLibrary();
  const { ownedIds } = useMyOils();

  const allBlends = [...BLENDS, ...customBlends];
  const blend = allBlends.find(b => b.id === id);

  if (!blend) {
    return (
      <View style={[styles.gradient, { flex: 1 }]}>
        <View style={[styles.screenHeader, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color="#f0e4c8" />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Blend not found</Text>
        </View>
      </View>
    );
  }

  if (blend.id.startsWith('custom_blend_')) {
    return (
      <View style={[styles.gradient, { flex: 1 }]}>
        <View style={[styles.screenHeader, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color="#f0e4c8" />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>No details available for custom blends.</Text>
        </View>
      </View>
    );
  }

  const botanicalKey = OIL_ICONS[blend.oils[0]?.id]?.botanical ?? 'sprout';
  const ownedCount = blend.oils.filter(bo => ownedIds.has(bo.id)).length;
  const blendOwned = ownedCount === blend.oils.length;

  return (
    <LinearGradient colors={['#1a1008', '#0d0806']} style={styles.gradient}>
      <View style={[styles.screenHeader, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#f0e4c8" />
        </Pressable>
        <Text style={styles.screenTitle} numberOfLines={1}>{blend.name}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={[styles.colorBar, { backgroundColor: blend.color }]} />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={{ marginBottom: Spacing.md }}>
              <BotanicalIcon botanicalKey={botanicalKey} size={56} color="rgba(255,255,255,0.85)" />
            </View>
            <Text style={styles.heroName}>{blend.name}</Text>
            <View style={[styles.kitBadge, blendOwned ? styles.kitBadgeOwned : styles.kitBadgeMissing]}>
              <Ionicons
                name={blendOwned ? 'checkmark-circle' : 'close-circle-outline'}
                size={13}
                color={blendOwned ? Colors.gold : Colors.textMuted}
              />
              <Text style={[styles.kitBadgeText, blendOwned ? { color: Colors.gold } : { color: Colors.textMuted }]}>
                {blendOwned ? 'All in kit' : `${ownedCount}/${blend.oils.length} in kit`}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Section title="About This Blend">
            <Text style={styles.bodyText}>{blend.description}</Text>
          </Section>

          {/* Sauna Note */}
          <Section title="In the Sauna">
            <View style={styles.saunaNoteBox}>
              <Ionicons name="thermometer-outline" size={20} color={Colors.gold} style={{ marginTop: 2 }} />
              <Text style={styles.saunaNoteText}>{blend.saunaNote}</Text>
            </View>
          </Section>

          {/* Composition */}
          <Section title="Composition">
            {blend.oils.map(bo => {
              const owned = ownedIds.has(bo.id);
              return (
                <View key={bo.id} style={styles.oilRow}>
                  <Ionicons
                    name={owned ? 'checkmark-circle' : 'close-circle-outline'}
                    size={14}
                    color={owned ? Colors.gold : Colors.textMuted}
                  />
                  <Text style={styles.oilName}>{bo.name}</Text>
                  <Text style={styles.oilDrops}>{bo.drops} drops</Text>
                </View>
              );
            })}
          </Section>

          {/* Benefits */}
          <Section title="Key Benefits">
            <View style={styles.tagsWrap}>
              {blend.benefits.map(b => (
                <View key={b} style={styles.benefitTag}>
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
            </View>
          </Section>

          {/* Best For */}
          <Section title="Best For">
            <View style={styles.tagsWrap}>
              {blend.vibes.map(v => (
                <View key={v} style={[styles.vibeTag, { backgroundColor: VIBE_BG[v] ?? 'rgba(255,255,255,0.06)' }]}>
                  <Ionicons name={VIBE_ICONS[v] as any} size={11} color={VIBE_COLORS[v] ?? Colors.textSecondary} />
                  <Text style={styles.vibeTagText}>{VIBE_LABELS[v] ?? v}</Text>
                </View>
              ))}
              {blend.timeOfDay.map(t => (
                <View key={t} style={styles.timeTag}>
                  <Ionicons name={TIME_ICONS[t] as any} size={11} color="rgba(48,128,176,0.9)" />
                  <Text style={styles.vibeTagText}>{TIME_LABELS[t]}</Text>
                </View>
              ))}
            </View>
          </Section>

          {/* Precautions */}
          {blend.precautions.length > 0 && (
            <Section title="Precautions">
              <View style={styles.tagsWrap}>
                {blend.precautions.map(p => (
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
    </LinearGradient>
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
    marginBottom: Spacing.xl,
  },
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
  headerSpacer: { width: 40 },
  notFound: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: Typography.sans,
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
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
  oilRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  oilName: {
    flex: 1,
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  oilDrops: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
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
