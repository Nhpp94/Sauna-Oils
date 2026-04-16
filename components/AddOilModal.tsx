import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EssentialOil, Vibe, TimeOfDay, NoteType } from '../data/oils';
import { Category, ALL_CATEGORIES, CATEGORY_META } from '../constants/categories';
import { Colors, Typography, FontSize, Spacing, Radius } from '../constants/theme';
import { VIBE_ICONS } from '../constants/icons';

const VIBES: { value: Vibe; label: string }[] = [
  { value: 'energizing', label: 'Energizing' },
  { value: 'relaxing', label: 'Relaxing' },
  { value: 'grounding', label: 'Grounding' },
  { value: 'meditative', label: 'Meditative' },
  { value: 'warming', label: 'Warming' },
  { value: 'awakening', label: 'Awakening' },
  { value: 'detox', label: 'Detox' },
  { value: 'creative', label: 'Creative' },
  { value: 'immune', label: 'Immune' },
];

const TIMES: { value: TimeOfDay; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

const NOTES: { value: NoteType; label: string; desc: string }[] = [
  { value: 'top', label: 'Top', desc: 'Opens first, fades fast' },
  { value: 'middle', label: 'Middle', desc: 'Heart of the blend' },
  { value: 'base', label: 'Base', desc: 'Deep, lasting anchor' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (oil: EssentialOil) => void;
}

export function AddOilModal({ visible, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [note, setNote] = useState<NoteType | null>(null);
  const [intensity, setIntensity] = useState<1 | 2 | 3>(2);
  const [selectedVibes, setSelectedVibes] = useState<Set<Vibe>>(new Set());
  const [selectedTimes, setSelectedTimes] = useState<Set<TimeOfDay>>(new Set());

  const toggleVibe = (v: Vibe) => {
    setSelectedVibes(prev => {
      const next = new Set(prev);
      next.has(v) ? next.delete(v) : next.add(v);
      return next;
    });
  };

  const toggleTime = (t: TimeOfDay) => {
    setSelectedTimes(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Name required', 'Please enter a name for your oil.'); return; }
    if (!category) { Alert.alert('Category required', 'Please select a category.'); return; }
    if (!note) { Alert.alert('Note required', 'Please select top, middle, or base note.'); return; }
    if (selectedVibes.size === 0) { Alert.alert('Vibe required', 'Select at least one vibe.'); return; }
    if (selectedTimes.size === 0) { Alert.alert('Time required', 'Select at least one time of day.'); return; }

    const oil: EssentialOil = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      latinName: '',
      category,
      note,
      intensity,
      vibes: [...selectedVibes] as Vibe[],
      timeOfDay: [...selectedTimes] as TimeOfDay[],
      bodyImpact: '',
      saunaNote: '',
      benefits: [],
      pairsWith: [],
      color: CATEGORY_META[category].color,
      emoji: '⭐',
      precautions: [],
    };

    onSave(oil);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setCategory(null);
    setNote(null);
    setIntensity(2);
    setSelectedVibes(new Set());
    setSelectedTimes(new Set());
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Custom Oil</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View style={styles.nameRow}>
              <TextInput
                style={[styles.input, styles.nameInput]}
                value={name}
                onChangeText={setName}
                placeholder="Oil name"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
              />
            </View>

            {/* Category */}
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {ALL_CATEGORIES.map(cat => {
                const meta = CATEGORY_META[cat];
                const active = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, active && { backgroundColor: meta.color + '20', borderColor: meta.color + '80' }]}
                    onPress={() => setCategory(cat)}
                  >
                    <Ionicons name={meta.icon as any} size={12} color={active ? meta.color : Colors.textMuted} />
                    <Text style={[styles.chipText, active && { color: meta.color }]}>{meta.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Note */}
            <Text style={styles.label}>Fragrance Note</Text>
            <View style={styles.noteRow}>
              {NOTES.map(n => {
                const active = note === n.value;
                return (
                  <TouchableOpacity
                    key={n.value}
                    style={[styles.noteTile, active && styles.noteTileActive]}
                    onPress={() => setNote(n.value)}
                  >
                    <Text style={[styles.noteTileLabel, active && styles.noteTileLabelActive]}>{n.label}</Text>
                    <Text style={styles.noteTileDesc}>{n.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Intensity */}
            <Text style={styles.label}>Intensity</Text>
            <View style={styles.intensityRow}>
              {([1, 2, 3] as const).map(i => (
                <TouchableOpacity
                  key={i}
                  style={[styles.intensityBtn, intensity === i && styles.intensityBtnActive]}
                  onPress={() => setIntensity(i)}
                >
                  <Text style={[styles.intensityDots, intensity === i && styles.intensityDotsActive]}>
                    {'●'.repeat(i) + '○'.repeat(3 - i)}
                  </Text>
                  <Text style={[styles.intensityLabel, intensity === i && styles.intensityLabelActive]}>
                    {i === 1 ? 'Subtle' : i === 2 ? 'Medium' : 'Strong'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Vibes */}
            <Text style={styles.label}>Vibes</Text>
            <View style={styles.vibeGrid}>
              {VIBES.map(v => {
                const active = selectedVibes.has(v.value);
                return (
                  <TouchableOpacity
                    key={v.value}
                    style={[styles.vibeChip, active && styles.vibeChipActive]}
                    onPress={() => toggleVibe(v.value)}
                  >
                    <Ionicons name={VIBE_ICONS[v.value] as any} size={13} color={active ? Colors.gold : Colors.textMuted} />
                    <Text style={[styles.vibeChipText, active && styles.vibeChipTextActive]}>{v.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Time of Day */}
            <Text style={styles.label}>Time of Day</Text>
            <View style={styles.timeRow}>
              {TIMES.map(t => {
                const active = selectedTimes.has(t.value);
                return (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.timeChip, active && styles.timeChipActive]}
                    onPress={() => toggleTime(t.value)}
                  >
                    <Text style={[styles.timeChipText, active && styles.timeChipTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Save */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Save Oil</Text>
              <Ionicons name="checkmark" size={18} color={Colors.bg} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  emojiInput: {
    width: 56,
    height: 56,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
    fontSize: FontSize.xxl,
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    fontFamily: Typography.sans,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  nameInput: {
    flex: 1,
    height: 56,
  },
  label: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chipRow: {
    gap: Spacing.xs,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  chipText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  noteRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  noteTile: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    gap: 3,
  },
  noteTileActive: {
    borderColor: Colors.goldDim,
    backgroundColor: Colors.goldDim,
  },
  noteTileLabel: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  noteTileLabelActive: {
    color: Colors.gold,
  },
  noteTileDesc: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  intensityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  intensityBtn: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    gap: 4,
  },
  intensityBtnActive: {
    borderColor: Colors.goldDim,
    backgroundColor: Colors.goldDim,
  },
  intensityDots: {
    fontFamily: Typography.sans,
    fontSize: FontSize.md,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  intensityDotsActive: {
    color: Colors.gold,
  },
  intensityLabel: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  intensityLabelActive: {
    color: Colors.gold,
  },
  vibeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  vibeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  vibeChipActive: {
    borderColor: Colors.goldDim,
    backgroundColor: Colors.goldDim,
  },
  vibeChipText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  vibeChipTextActive: {
    color: Colors.gold,
  },
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  timeChip: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
  },
  timeChipActive: {
    borderColor: Colors.goldDim,
    backgroundColor: Colors.goldDim,
  },
  timeChipText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  timeChipTextActive: {
    color: Colors.gold,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.gold,
  },
  saveBtnText: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.lg,
    color: Colors.bg,
  },
});
