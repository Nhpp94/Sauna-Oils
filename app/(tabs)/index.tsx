import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getDailyFact } from '../../data/funFacts';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import GrainOverlay from '../../components/GrainOverlay';

export default function HomeScreen() {
  const router = useRouter();
  const dailyFact = getDailyFact();

  return (
    <ImageBackground
      source={require('../../assets/Sauna Home background.jpg')}
      style={styles.gradient}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(10,7,4,0.35)', 'rgba(10,7,4,0.82)', '#0a0704']}
        style={StyleSheet.absoluteFill}
      />
      <GrainOverlay />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.layout}>

          <View style={styles.spacer} />

          {/* Hero */}
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Sauna Oils</Text>
            <Text style={styles.heroSubtitle}>
              Curate your personal sauna experience using aromatherapy
            </Text>
          </View>

          <View style={styles.spacer} />

          {/* Fun fact card */}
          <View style={styles.funFactCard}>
            <Text style={styles.funFactTitle}>Fun Fact of the Day</Text>
            <Text style={styles.funFactText}>{dailyFact}</Text>
          </View>

          <View style={styles.spacer} />

          {/* Primary CTA */}
          <TouchableOpacity
            style={styles.mainCta}
            onPress={() => router.push('/session')}
            activeOpacity={0.85}
          >
            <Text style={styles.mainCtaTitle}>Build Your Session</Text>
            <Text style={styles.mainCtaSubtitle}>Choose vibe + time → get 3 perfect oils</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  layout: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  spacer: {
    flex: 1,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.hero,
    color: Colors.textPrimary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 220,
  },
  funFactCard: {
    backgroundColor: 'rgba(234,226,205,0.05)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(234,226,205,0.18)',
    padding: Spacing.lg,
    alignItems: 'center',
  },
  funFactTitle: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  funFactText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.md,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  mainCta: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  mainCtaTitle: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xl,
    color: Colors.bg,
    textAlign: 'center',
  },
  mainCtaSubtitle: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: 'rgba(13,8,6,0.65)',
    marginTop: 2,
    textAlign: 'center',
  },
});
