import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import GrainOverlay from '../../components/GrainOverlay';
import { SessionBuilder } from '../../components/SessionBuilder';
import { useSession } from '../../hooks/useSession';
import { useCustomLibrary } from '../../context/CustomLibraryContext';
import { useStudio } from '../../context/StudioContext';
import { Colors } from '../../constants/theme';
import { setSharedSession } from '../../store/sessionStore';

export default function SessionTab() {
  const router = useRouter();
  const { customOils } = useCustomLibrary();
  const { studio, studioOils } = useStudio();
  const session = useSession(customOils, studioOils);
  setSharedSession(session);

  const handleGenerate = () => {
    session.generateRounds();
    router.push('/session/result');
  };

  return (
    <View style={styles.container}>
      <GrainOverlay />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
          studioOilCount={studioOils.length > 0 ? studioOils.length : undefined}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { flexGrow: 1 },
});
