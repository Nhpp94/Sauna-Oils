import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GrainOverlay from '../../components/GrainOverlay';
import { SessionBuilder } from '../../components/SessionBuilder';
import { useSession } from '../../hooks/useSession';
import { useCustomLibrary } from '../../context/CustomLibraryContext';
import { Colors, Typography, FontSize } from '../../constants/theme';
import { setSharedSession } from '../../store/sessionStore';
export default function SessionScreen() {
  const router = useRouter();
  const { customOils } = useCustomLibrary();
  const session = useSession(customOils);

  useEffect(() => {
    setSharedSession(session);
  });

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
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SessionBuilder
          selectedVibe={session.vibe}
          selectedTime={session.time}
          onVibeChange={session.setVibe}
          onTimeChange={session.setTime}
          onGenerate={handleGenerate}
          kitOnly={session.kitOnly}
          onKitOnlyChange={session.setKitOnly}
          kitOilCount={session.kitOilCount}
        />
      </ScrollView>
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
  scroll: { flex: 1 },
  content: { flexGrow: 1 },
});
