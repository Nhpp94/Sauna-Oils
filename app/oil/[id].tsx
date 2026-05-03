import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyOils } from '../../hooks/useMyOils';
import { useRemoteData } from '../../context/RemoteDataContext';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import { CATEGORY_META } from '../../constants/categories';
import { VIBE_ICONS, VIBE_COLORS, TIME_ICONS, NOTE_ICONS } from '../../constants/icons';
import { OilIcon } from '../../components/OilIcon';

const NOTE_FULL: Record<string, string> = {
  top: 'Top note — opens the ceremony',
  middle: 'Heart note — carries the session',
  base: 'Base note — anchors the blend',
};

const INTENSITY_TEXT: Record<number, string> = {
  1: 'Light',
  2: 'Medium',
  3: 'Strong — use sparingly',
};

const INTENSITY_DOTS = (n: number) => '●'.repeat(n) + '○'.repeat(3 - n);

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

export default function OilDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isOwned, toggleOwned } = useMyOils();

  const insets = useSafeAreaInsets();
  const { oils } = useRemoteData();
  const oil = oils.find(o => o.id === id);
  if (!oil) {
    return (
      <View style={[styles.gradient, { backgroundColor: Colors.bg, flex: 1 }]}>
        <View style={[styles.screenHeader, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color="#f0e4c8" />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Oil not found</Text>
        </View>
      </View>
    );
  }
  const owned = isOwned(oil.id);
  const meta = CATEGORY_META[oil.category];
  const pairOils = oil.pairsWith.map(pid => oils.find(o => o.id === pid)).filter(Boolean);

  return (
    <View style={[styles.gradient, { backgroundColor: Colors.bg }]}>
      <View style={[styles.screenHeader, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#f0e4c8" />
        </Pressable>
        <Text style={styles.screenTitle} numberOfLines={1}>{oil.name}</Text>
        <TouchableOpacity onPress={() => toggleOwned(oil.id)} style={styles.headerRight}>
          <Ionicons name={owned ? 'checkmark-circle' : 'add-circle-outline'} size={22} color={owned ? Colors.gold : Colors.textPrimary} />
        </TouchableOpacity>
      </View>
      <View style={[styles.colorBar, { backgroundColor: meta.color }]} />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={{ marginBottom: Spacing.md }}>
              <OilIcon oil={oil} size={56} />
            </View>
            <Text style={styles.heroName}>{oil.name}</Text>
            <Text style={styles.heroLatin}>{oil.latinName}</Text>

            <View style={styles.heroTags}>
              <View style={[styles.heroTag, { backgroundColor: meta.color + '25', borderColor: meta.color + '50' }]}>
                <Ionicons name={meta.icon as any} size={13} color={meta.color} />
                <Text style={[styles.heroTagText, { color: meta.color }]}>{meta.label}</Text>
              </View>
              <View style={styles.heroTag}>
                <Ionicons name={NOTE_ICONS[oil.note] as any} size={13} color={Colors.textSecondary} />
                <Text style={styles.heroTagText}>{NOTE_FULL[oil.note]}</Text>
              </View>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>
                  {INTENSITY_DOTS(oil.intensity)} {INTENSITY_TEXT[oil.intensity]}
                </Text>
              </View>
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

          {/* Best For */}
          <Section title="Best For">
            <View style={styles.tagsWrap}>
              {oil.vibes.map(v => (
                <View key={v} style={[styles.vibeTag, { backgroundColor: VIBE_BG[v] ?? 'rgba(255,255,255,0.06)' }]}>
                  <Ionicons name={VIBE_ICONS[v] as any} size={11} color={VIBE_COLORS[v] ?? Colors.textSecondary} />
                  <Text style={styles.vibeTagText}>{VIBE_LABELS[v] ?? v}</Text>
                </View>
              ))}
              {oil.timeOfDay.map(t => (
                <View key={t} style={styles.timeTag}>
                  <Ionicons name={TIME_ICONS[t] as any} size={11} color="rgba(48,128,176,0.9)" />
                  <Text style={styles.vibeTagText}>{TIME_LABELS[t]}</Text>
                </View>
              ))}
            </View>
          </Section>

          {/* Precautions */}
          {oil.precautions.length > 0 && (
            <Section title="Precautions">
              <View style={styles.tagsWrap}>
                {oil.precautions.map(p => (
                  <View key={p} style={styles.precautionTag}>
                    <Ionicons name="warning-outline" size={11} color="#c87020" />
                    <Text style={styles.precautionText}>{p}</Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* Pairings */}
          {pairOils.length > 0 && (
            <Section title="Pairs Beautifully With">
              <View style={styles.tagsWrap}>
                {pairOils.map(pair => pair && (
                  <TouchableOpacity
                    key={pair.id}
                    style={[styles.pairTag, { borderColor: pair.color + '60' }]}
                    onPress={() => router.push(`/oil/${pair.id}`)}
                  >
                    <OilIcon oil={pair} size={14} />
                    <Text style={styles.pairName}>{pair.name}</Text>
                  </TouchableOpacity>
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
  headerRight: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
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
  colorBar: {
    height: 4,
  },
  scroll: { flex: 1 },
  content: {
    padding: Spacing.lg,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
  },
  heroName: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.display,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  heroLatin: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginBottom: Spacing.lg,
  },
  heroTags: {
    gap: Spacing.xs,
    width: '100%',
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroTagText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
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
  tagsWrap: {
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
  vibeTagText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
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
