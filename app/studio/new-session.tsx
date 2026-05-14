import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStudio } from '../../context/StudioContext';
import { TrioResult } from '../../components/TrioResult';
import { SwapModal } from '../../components/SwapModal';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import GrainOverlay from '../../components/GrainOverlay';
import { VIBE_META, VIBE_ICONS, VIBE_COLORS, TIME_ICONS } from '../../constants/icons';
import { SessionSlot, SessionTrio } from '../../data/recommendations';
import { Vibe, TimeOfDay, EssentialOil } from '../../data/oils';
import { Incense } from '../../data/incense';
import { Blend } from '../../data/blends';

const VIBES = VIBE_META;

const TIMES: { value: TimeOfDay; label: string }[] = [
  { value: 'morning',   label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening',   label: 'Evening' },
];

type SwapTarget =
  | { kind: 'slot'; roundIndex: number; slotIndex: number; oil: EssentialOil | null }
  | { kind: 'incense'; roundIndex: number };

interface RoundState {
  slots: (SessionSlot | null)[];
  incense: Incense | undefined;
}

const emptyRound = (): RoundState => ({ slots: [null, null, null], incense: undefined });

export default function NewStudioSessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { studio, studioKitOils, studioKitIncense, studioKitBlends, addSessionToStudio } = useStudio();

  const [localRounds, setLocalRounds] = useState<RoundState[]>([
    emptyRound(), emptyRound(), emptyRound(),
  ]);
  const [localVibe, setLocalVibe] = useState<Vibe | null>(null);
  const [localTime, setLocalTime] = useState<TimeOfDay | null>(null);
  const [activeRound, setActiveRound] = useState(0);
  const [swapTarget, setSwapTarget] = useState<SwapTarget | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [step, setStep] = useState<'build' | 'name'>('build');
  const [sessionName, setSessionName] = useState('');
  const [sessionDesc, setSessionDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const browseOils = useMemo(
    () => studioKitOils.map(o => ({ ...o, compatibilityScore: 0 as number })),
    [studioKitOils],
  );
  const studioOilIds = useMemo(() => new Set(studioKitOils.map(o => o.id)), [studioKitOils]);
  const studioIncenseIds = useMemo(() => new Set(studioKitIncense.map(i => i.id)), [studioKitIncense]);

  const canSave = localRounds.every(r => r.slots.some(s => s !== null));
  const currentRound = localRounds[activeRound];

  const handleUseOil = (oil: EssentialOil) => {
    if (!swapTarget || swapTarget.kind !== 'slot') return;
    const { roundIndex, slotIndex } = swapTarget;
    setLocalRounds(prev => prev.map((r, i) => i !== roundIndex ? r : {
      ...r,
      slots: r.slots.map((s, j) => j === slotIndex ? { kind: 'oil' as const, oil } : s),
    }));
    setSwapTarget(null);
  };

  const handleUseBlend = (blend: Blend) => {
    if (!swapTarget || swapTarget.kind !== 'slot') return;
    const { roundIndex, slotIndex } = swapTarget;
    setLocalRounds(prev => prev.map((r, i) => i !== roundIndex ? r : {
      ...r,
      slots: r.slots.map((s, j) => j === slotIndex ? { kind: 'blend' as const, blend } : s),
    }));
    setSwapTarget(null);
  };

  const handleUseIncense = (incense: Incense) => {
    if (!swapTarget || swapTarget.kind !== 'incense') return;
    const { roundIndex } = swapTarget;
    setLocalRounds(prev => prev.map((r, i) => i !== roundIndex ? r : { ...r, incense }));
    setSwapTarget(null);
  };

  function handleNext() {
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const defaultName = [
      localVibe ? cap(localVibe) : '',
      localTime ? cap(localTime) : '',
      'Session',
    ].filter(Boolean).join(' ');
    setSessionName(defaultName);
    setStep('name');
  }

  async function handleSave() {
    if (!sessionName.trim()) {
      Alert.alert('Name required', 'Please give this session a name.');
      return;
    }
    setSaving(true);
    const rounds: SessionTrio[] = localRounds.map(r => ({
      slots: r.slots.map(s => s ?? { kind: 'empty' as const }),
      narrative: '',
      incense: r.incense,
    }));
    const err = await addSessionToStudio({
      name: sessionName.trim(),
      description: sessionDesc.trim() || null,
      rounds,
      vibe: localVibe,
      time_of_day: localTime,
    });
    setSaving(false);
    if (err) {
      Alert.alert('Error', err);
    } else {
      router.back();
    }
  }

  const vibeLabel = localVibe ? localVibe.charAt(0).toUpperCase() + localVibe.slice(1) : null;
  const timeLabel = localTime ? localTime.charAt(0).toUpperCase() + localTime.slice(1) : null;

  return (
    <View style={styles.container}>
      <GrainOverlay />

      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <Pressable
          onPress={() => step === 'name' ? setStep('build') : router.back()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{step === 'name' ? 'Name Session' : 'New Session'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'build' && (
          <>
            {/* Optional vibe/time context */}
            <TouchableOpacity
              style={styles.contextToggle}
              onPress={() => setShowContext(v => !v)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={(localVibe ? VIBE_ICONS[localVibe] : 'options-outline') as any}
                size={15}
                color={localVibe ? VIBE_COLORS[localVibe] : Colors.textSecondary}
              />
              <Text style={[styles.contextToggleText, localVibe && { color: VIBE_COLORS[localVibe] }]}>
                {vibeLabel && timeLabel
                  ? `${vibeLabel} · ${timeLabel}`
                  : vibeLabel || timeLabel
                  ? vibeLabel ?? timeLabel
                  : 'Set vibe & time (optional)'}
              </Text>
              <Ionicons
                name={showContext ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            {showContext && (
              <View style={styles.contextPanel}>
                <Text style={styles.sectionLabel}>Vibe</Text>
                <View style={styles.vibeGrid}>
                  {VIBES.map(v => {
                    const active = localVibe === v.value;
                    return (
                      <TouchableOpacity
                        key={v.value}
                        style={[styles.vibePill, active && { borderColor: v.color, backgroundColor: v.color + '22' }]}
                        onPress={() => setLocalVibe(active ? null : v.value)}
                        activeOpacity={0.75}
                      >
                        <Ionicons
                          name={VIBE_ICONS[v.value] as any}
                          size={13}
                          color={active ? v.color : Colors.textMuted}
                        />
                        <Text style={[styles.vibePillText, active && { color: v.color }]}>{v.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>Time of Day</Text>
                <View style={styles.timeRow}>
                  {TIMES.map(t => {
                    const active = localTime === t.value;
                    return (
                      <TouchableOpacity
                        key={t.value}
                        style={[styles.timePill, active && styles.timePillActive]}
                        onPress={() => setLocalTime(active ? null : t.value)}
                        activeOpacity={0.75}
                      >
                        <Ionicons
                          name={TIME_ICONS[t.value] as any}
                          size={13}
                          color={active ? Colors.bg : Colors.textSecondary}
                        />
                        <Text style={[styles.timePillText, active && styles.timePillTextActive]}>
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Round tabs */}
            <View style={styles.roundTabs}>
              {localRounds.map((r, i) => {
                const filled = r.slots.filter(s => s !== null).length;
                const isActive = activeRound === i;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.roundTab, isActive && styles.roundTabActive]}
                    onPress={() => setActiveRound(i)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.roundTabText, isActive && styles.roundTabTextActive]}>
                      Round {i + 1}
                    </Text>
                    {filled > 0 && (
                      <View style={[styles.roundBadge, isActive && styles.roundBadgeActive]}>
                        <Text style={[styles.roundBadgeText, isActive && styles.roundBadgeTextActive]}>
                          {filled}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Slots */}
            <TrioResult
              slots={currentRound.slots.map(s => s ?? { kind: 'empty' as const })}
              narrative=""
              vibe={localVibe}
              time={localTime}
              ownedIds={studioOilIds}
              onOilPress={oil => router.push(`/oil/${oil.id}`)}
              onSwapPress={(slotIndex, oil) => setSwapTarget({
                kind: 'slot',
                roundIndex: activeRound,
                slotIndex,
                oil: oil ?? null,
              })}
              onBlendPress={blend => {
                if (!blend.id.startsWith('studio_custom_blend_')) router.push(`/blend/${blend.id}`);
              }}
            />

            {/* Incense row */}
            <TouchableOpacity
              style={[styles.incenseRow, currentRound.incense && styles.incenseRowFilled]}
              onPress={() => setSwapTarget({ kind: 'incense', roundIndex: activeRound })}
              activeOpacity={0.75}
            >
              <Ionicons
                name="flame-outline"
                size={16}
                color={currentRound.incense ? Colors.resinous : Colors.textMuted}
              />
              <View style={styles.slotInfo}>
                <Text style={[styles.slotMeta, currentRound.incense && { color: Colors.textSecondary }]}>
                  {currentRound.incense ? currentRound.incense.name : 'Add atmosphere (optional)'}
                </Text>
                {currentRound.incense && (
                  <Text style={styles.incenseMeta}>
                    {currentRound.incense.form} · {currentRound.incense.origin}
                  </Text>
                )}
              </View>
              <Ionicons
                name={currentRound.incense ? 'swap-horizontal-outline' : 'add-outline'}
                size={16}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            <View style={{ height: 110 }} />
          </>
        )}

        {step === 'name' && (
          <View style={styles.form}>
            <View style={styles.summaryRow}>
              {localVibe && (
                <View style={[styles.chip, { borderColor: (VIBE_COLORS[localVibe] ?? Colors.textMuted) + '44', backgroundColor: (VIBE_COLORS[localVibe] ?? Colors.textMuted) + '18' }]}>
                  <Ionicons name={(VIBE_ICONS[localVibe] ?? 'flash-outline') as any} size={12} color={VIBE_COLORS[localVibe] ?? Colors.textMuted} />
                  <Text style={[styles.chipText, { color: VIBE_COLORS[localVibe] ?? Colors.textMuted }]}>{vibeLabel}</Text>
                </View>
              )}
              {localTime && (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{timeLabel}</Text>
                </View>
              )}
              <View style={styles.chip}>
                <Ionicons name="layers-outline" size={11} color={Colors.textMuted} />
                <Text style={styles.chipText}>{localRounds.length} rounds</Text>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Session name</Text>
              <TextInput
                style={styles.input}
                value={sessionName}
                onChangeText={setSessionName}
                placeholder="e.g. Morning Energiser"
                placeholderTextColor={Colors.textMuted}
                autoFocus
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={sessionDesc}
                onChangeText={setSessionDesc}
                placeholder="Notes for your gus meisters..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color={Colors.bg} />
                : <>
                    <Ionicons name="checkmark-circle-outline" size={18} color={Colors.bg} />
                    <Text style={styles.saveBtnText}>Save to Studio</Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Save CTA — only shown on build step */}
      {step === 'build' && (
        <View style={styles.ctaBar}>
          <TouchableOpacity
            style={[styles.ctaBtn, !canSave && styles.ctaBtnDisabled]}
            onPress={canSave ? handleNext : undefined}
            activeOpacity={canSave ? 0.85 : 1}
          >
            <Text style={[styles.ctaBtnText, !canSave && styles.ctaBtnTextDisabled]}>
              Save to Studio
            </Text>
            {!canSave && (
              <Text style={styles.ctaHint}>Add at least one oil to each round</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <SwapModal
        visible={!!swapTarget}
        oilToReplace={swapTarget?.kind === 'slot' ? (swapTarget.oil ?? null) : null}
        suggestion={null}
        browseOils={browseOils}
        browseBlends={studioKitBlends}
        ownedIds={studioOilIds}
        ownedIncenseIds={studioIncenseIds}
        browseIncense={studioKitIncense}
        vibe={localVibe}
        time={localTime}
        initialTab={swapTarget?.kind === 'incense' ? 'incense' : 'oils'}
        onUseOil={handleUseOil}
        onUseBlend={handleUseBlend}
        onUseIncense={handleUseIncense}
        onClose={() => setSwapTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg },
  contextToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
  },
  contextToggleText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  contextPanel: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontFamily: Typography.sansBold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  vibeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  vibePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  vibePillText: { fontFamily: Typography.sansMedium, fontSize: FontSize.xs, color: Colors.textMuted },
  timeRow: { flexDirection: 'row', gap: Spacing.sm },
  timePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  timePillActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  timePillText: { fontFamily: Typography.sansMedium, fontSize: FontSize.xs, color: Colors.textSecondary },
  timePillTextActive: { color: Colors.bg },
  roundTabs: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  roundTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  roundTabActive: { borderColor: Colors.goldDim, backgroundColor: Colors.goldDim },
  roundTabText: { fontFamily: Typography.sansMedium, fontSize: FontSize.sm, color: Colors.textMuted },
  roundTabTextActive: { color: Colors.gold },
  roundBadge: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  roundBadgeActive: { backgroundColor: 'rgba(234,226,205,0.3)' },
  roundBadgeText: { fontFamily: Typography.sansBold, fontSize: FontSize.xxs, color: Colors.textMuted },
  roundBadgeTextActive: { color: Colors.gold },
  slotInfo: { flex: 1 },
  slotMeta: { fontFamily: Typography.sans, fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'capitalize', marginTop: 1 },
  incenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  incenseRowFilled: { borderColor: Colors.borderGold },
  incenseMeta: { fontFamily: Typography.sans, fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'capitalize' },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: 34,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ctaBtn: { backgroundColor: Colors.gold, borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' },
  ctaBtnDisabled: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  ctaBtnText: { fontFamily: Typography.serifBold, fontSize: FontSize.xl, color: Colors.bg },
  ctaBtnTextDisabled: { color: Colors.textMuted },
  ctaHint: { fontFamily: Typography.sans, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  form: { gap: Spacing.md },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard },
  chipText: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted, textTransform: 'capitalize' },
  fieldGroup: { gap: Spacing.xs },
  label: { fontFamily: Typography.sansMedium, fontSize: FontSize.sm, color: Colors.textSecondary },
  input: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textPrimary },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.gold, borderRadius: Radius.md, paddingVertical: Spacing.md, marginTop: Spacing.sm },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontFamily: Typography.sansBold, fontSize: FontSize.md, color: Colors.bg },
});
