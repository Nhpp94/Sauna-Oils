import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudio } from '../../context/StudioContext';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import GrainOverlay from '../../components/GrainOverlay';

export default function JoinStudioScreen() {
  const router = useRouter();
  const { joinStudio } = useStudio();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (!code.trim()) return;
    setError(null);
    setLoading(true);
    const err = await joinStudio(code.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.back();
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GrainOverlay />
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="close" size={22} color={Colors.textMuted} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="business-outline" size={40} color={Colors.gold} />
        </View>

        <Text style={styles.title}>Join a Studio</Text>
        <Text style={styles.subtitle}>
          Enter the 6-character code shared by your sauna house admin.
        </Text>

        <TextInput
          style={styles.codeInput}
          placeholder="STUDIO CODE"
          placeholderTextColor={Colors.textMuted}
          value={code}
          onChangeText={v => setCode(v.toUpperCase())}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={handleJoin}
        />

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={14} color={Colors.spicy} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.joinBtn, (!code.trim() || loading) && styles.joinBtnDisabled]}
          onPress={handleJoin}
          activeOpacity={0.85}
          disabled={!code.trim() || loading}
        >
          {loading
            ? <ActivityIndicator size="small" color={Colors.bg} />
            : <Text style={styles.joinBtnText}>Join Studio</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.goldDim,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xxl,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Typography.sans,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.md * 1.6,
    paddingHorizontal: Spacing.lg,
  },
  codeInput: {
    width: '100%',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xxl,
    color: Colors.gold,
    textAlign: 'center',
    letterSpacing: 6,
    marginTop: Spacing.sm,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.errorBg,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
    borderRadius: Radius.md,
    padding: Spacing.md,
    width: '100%',
  },
  errorText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: Colors.errorText,
    flex: 1,
  },
  joinBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing.sm,
  },
  joinBtnDisabled: {
    opacity: 0.4,
  },
  joinBtnText: {
    fontFamily: Typography.sansBold,
    fontSize: FontSize.md,
    color: Colors.bg,
  },
});
