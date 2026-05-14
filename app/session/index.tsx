import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GrainOverlay from '../../components/GrainOverlay';
import { SessionBuilder } from '../../components/SessionBuilder';
import { useSession } from '../../hooks/useSession';
import { useCustomLibrary } from '../../context/CustomLibraryContext';
import { useStudio } from '../../context/StudioContext';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import { setSharedSession, getPendingLoad, clearPendingLoad, setActiveSavedSessionId } from '../../store/sessionStore';

export default function SessionScreen() {
  const router = useRouter();
  const { customOils } = useCustomLibrary();
  const { studio, studioKitOils, studioKitIncense, studioKitBlends } = useStudio();
  const session = useSession(customOils, studioKitOils, studioKitIncense, studioKitBlends);
  const [mode, setMode] = useState<'generate' | 'build'>('generate');

  useEffect(() => {
    setSharedSession(session);
  });

  // On mount: check if a saved session is pending to be loaded
  useEffect(() => {
    const pending = getPendingLoad();
    if (pending) {
      const normalizedPending = {
        ...pending,
        rounds: pending.rounds.map((r: any) => ({
          ...r,
          slots: r.slots.length >= 3
            ? r.slots
            : [...r.slots, ...Array(3 - r.slots.length).fill({ kind: 'empty' })],
        })),
      };
      setActiveSavedSessionId(pending.id);
      setSharedSession({ ...session, ...normalizedPending, source: normalizedPending.source });
      session.hydrateFromSaved(normalizedPending);
      clearPendingLoad();
      router.replace('/session/result');
    } else {
      setActiveSavedSessionId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = () => {
    session.generateRounds();
    router.push('/session/result');
  };

  return (
    <View style={styles.container}>
      <GrainOverlay />
      <View style={[styles.screenHeader, { paddingTop: 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#f0e4c8" />
        </Pressable>
        <Text style={styles.screenTitle}>Session Builder</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Mode toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'generate' && styles.modeTabActive]}
          onPress={() => setMode('generate')}
          activeOpacity={0.75}
        >
          <Ionicons
            name="flash-outline"
            size={15}
            color={mode === 'generate' ? Colors.bg : Colors.textSecondary}
          />
          <Text style={[styles.modeTabText, mode === 'generate' && styles.modeTabTextActive]}>
            Generate
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'build' && styles.modeTabActive]}
          onPress={() => setMode('build')}
          activeOpacity={0.75}
        >
          <Ionicons
            name="construct-outline"
            size={15}
            color={mode === 'build' ? Colors.bg : Colors.textSecondary}
          />
          <Text style={[styles.modeTabText, mode === 'build' && styles.modeTabTextActive]}>
            Build
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'generate' ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <SessionBuilder
            selectedVibe={session.vibe}
            selectedTime={session.time}
            onVibeChange={session.setVibe}
            onTimeChange={session.setTime}
            onGenerate={handleGenerate}
            oilSource={session.oilSource}
            onOilSourceChange={session.setOilSource}
            oilCount={session.kitOilCount}
            studioName={studio?.name}
          />
        </ScrollView>
      ) : (
        <View style={styles.buildModeContainer}>
          <View style={styles.buildModeCard}>
            <Ionicons name="layers-outline" size={32} color={Colors.gold} style={{ marginBottom: Spacing.md }} />
            <Text style={styles.buildModeTitle}>Craft Your Own Session</Text>
            <Text style={styles.buildModeDesc}>
              Choose exactly which oils, blends, and incense go into each of your three rounds. No algorithm — just your intuition.
            </Text>
            <TouchableOpacity
              style={styles.buildBtn}
              onPress={() => router.push('/session/build')}
              activeOpacity={0.85}
            >
              <Text style={styles.buildBtnText}>Continue to Build</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.bg} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xl,
    color: '#f0e4c8',
  },
  headerSpacer: { width: 40 },
  modeToggle: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
    gap: 3,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  modeTabActive: {
    backgroundColor: Colors.gold,
  },
  modeTabText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  modeTabTextActive: {
    color: Colors.bg,
    fontFamily: Typography.sansBold,
  },
  scroll: { flex: 1 },
  content: { flexGrow: 1 },
  buildModeContainer: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  buildModeCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  buildModeTitle: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xxl,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  buildModeDesc: {
    fontFamily: Typography.sans,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  buildBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.gold,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  buildBtnText: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.lg,
    color: Colors.bg,
  },
});
