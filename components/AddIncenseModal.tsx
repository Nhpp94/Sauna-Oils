import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Incense, IncenseForm } from '../data/incense';
import { Vibe, TimeOfDay } from '../data/oils';
import { Colors, Typography, FontSize, Spacing, Radius } from '../constants/theme';
import { FORM_META } from '../constants/incenseForms';
import { VIBE_META, VIBE_ICONS, TIME_ICONS } from '../constants/icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (incense: Incense, addToKit?: boolean) => void | Promise<void>;
  title?: string;
  saveLabel?: string;
  showAddToKitToggle?: boolean;
}

const FORMS: IncenseForm[] = ['wood', 'resin', 'herb', 'stick', 'cone'];
const TIMES: { value: TimeOfDay; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

function splitList(value: string) {
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

export function AddIncenseModal({
  visible,
  onClose,
  onSave,
  title = 'Create Incense',
  saveLabel = 'Save Incense',
  showAddToKitToggle = false,
}: Props) {
  const [name, setName] = useState('');
  const [latinName, setLatinName] = useState('');
  const [origin, setOrigin] = useState('');
  const [form, setForm] = useState<IncenseForm>('wood');
  const [description, setDescription] = useState('');
  const [saunaNote, setSaunaNote] = useState('');
  const [benefits, setBenefits] = useState('');
  const [precautions, setPrecautions] = useState('');
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [times, setTimes] = useState<TimeOfDay[]>([]);
  const [addToKit, setAddToKit] = useState(true);

  const toggleVibe = (vibe: Vibe) => {
    setVibes(prev => prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]);
  };

  const toggleTime = (time: TimeOfDay) => {
    setTimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]);
  };

  const handleClose = () => {
    setName('');
    setLatinName('');
    setOrigin('');
    setForm('wood');
    setDescription('');
    setSaunaNote('');
    setBenefits('');
    setPrecautions('');
    setVibes([]);
    setTimes([]);
    setAddToKit(true);
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Name required', 'Please enter a name for your incense.'); return; }
    if (!origin.trim()) { Alert.alert('Origin required', 'Please add an origin or source.'); return; }
    if (vibes.length === 0) { Alert.alert('Choose a vibe', 'Select at least one vibe.'); return; }
    if (times.length === 0) { Alert.alert('Choose a time', 'Select at least one time of day.'); return; }

    const meta = FORM_META[form];
    const incense: Incense = {
      id: `custom_incense_${Date.now()}`,
      name: name.trim(),
      latinName: latinName.trim() || undefined,
      origin: origin.trim(),
      form,
      vibes,
      timeOfDay: times,
      description: description.trim() || `${name.trim()} is a studio-created incense for ritual atmosphere.`,
      saunaNote: saunaNote.trim() || 'Use with good airflow and keep all burning material outside the occupied sauna cabin.',
      benefits: splitList(benefits),
      precautions: splitList(precautions),
      color: meta.color,
      emoji: form === 'herb' ? '🌿' : form === 'resin' ? '🕯️' : '🪵',
    };

    await onSave(incense, addToKit);
    handleClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Incense name" placeholderTextColor={Colors.textMuted} autoCapitalize="words" />
            <TextInput style={styles.input} value={latinName} onChangeText={setLatinName} placeholder="Latin name (optional)" placeholderTextColor={Colors.textMuted} autoCapitalize="words" />
            <TextInput style={styles.input} value={origin} onChangeText={setOrigin} placeholder="Origin or source" placeholderTextColor={Colors.textMuted} autoCapitalize="words" />

            <Text style={styles.label}>Form</Text>
            <View style={styles.wrapRow}>
              {FORMS.map(item => {
                const active = form === item;
                const meta = FORM_META[item];
                return (
                  <TouchableOpacity key={item} style={[styles.pill, active && { borderColor: meta.color, backgroundColor: meta.color + '22' }]} onPress={() => setForm(item)} activeOpacity={0.75}>
                    <Ionicons name={meta.icon as any} size={13} color={active ? meta.color : Colors.textMuted} />
                    <Text style={[styles.pillText, active && { color: meta.color }]}>{meta.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Vibes</Text>
            <View style={styles.wrapRow}>
              {VIBE_META.map(item => {
                const active = vibes.includes(item.value);
                return (
                  <TouchableOpacity key={item.value} style={[styles.pill, active && { borderColor: item.color, backgroundColor: item.color + '22' }]} onPress={() => toggleVibe(item.value)} activeOpacity={0.75}>
                    <Ionicons name={VIBE_ICONS[item.value] as any} size={13} color={active ? item.color : Colors.textMuted} />
                    <Text style={[styles.pillText, active && { color: item.color }]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Time of day</Text>
            <View style={styles.wrapRow}>
              {TIMES.map(item => {
                const active = times.includes(item.value);
                return (
                  <TouchableOpacity key={item.value} style={[styles.pill, active && styles.pillActive]} onPress={() => toggleTime(item.value)} activeOpacity={0.75}>
                    <Ionicons name={TIME_ICONS[item.value] as any} size={13} color={active ? Colors.gold : Colors.textMuted} />
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor={Colors.textMuted} multiline />
            <TextInput style={[styles.input, styles.textArea]} value={saunaNote} onChangeText={setSaunaNote} placeholder="Sauna note" placeholderTextColor={Colors.textMuted} multiline />
            <TextInput style={styles.input} value={benefits} onChangeText={setBenefits} placeholder="Benefits, comma separated" placeholderTextColor={Colors.textMuted} />
            <TextInput style={styles.input} value={precautions} onChangeText={setPrecautions} placeholder="Precautions, comma separated" placeholderTextColor={Colors.textMuted} />

            {showAddToKitToggle && (
              <TouchableOpacity style={styles.toggleRow} onPress={() => setAddToKit(v => !v)} activeOpacity={0.75}>
                <View style={[styles.checkbox, addToKit && styles.checkboxActive]}>
                  {addToKit && <Ionicons name="checkmark" size={13} color={Colors.bg} />}
                </View>
                <View style={styles.toggleCopy}>
                  <Text style={styles.toggleTitle}>Add to Studio Kit</Text>
                  <Text style={styles.toggleSubtitle}>Make this incense available for sessions right away</Text>
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>{saveLabel}</Text>
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
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontFamily: Typography.serifBold, fontSize: FontSize.xl, color: Colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, gap: Spacing.md },
  input: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textPrimary },
  textArea: { minHeight: 84, textAlignVertical: 'top' },
  label: { fontFamily: Typography.sansBold, fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.bgCard },
  pillActive: { borderColor: Colors.borderGold, backgroundColor: Colors.goldDim },
  pillText: { fontFamily: Typography.sansMedium, fontSize: FontSize.xs, color: Colors.textMuted },
  pillTextActive: { color: Colors.gold },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md },
  checkbox: { width: 22, height: 22, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.borderGold, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  toggleCopy: { flex: 1 },
  toggleTitle: { fontFamily: Typography.sansMedium, fontSize: FontSize.md, color: Colors.textPrimary },
  toggleSubtitle: { fontFamily: Typography.sans, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  footer: { padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md + 2, borderRadius: Radius.full, backgroundColor: Colors.gold },
  saveBtnText: { fontFamily: Typography.serifBold, fontSize: FontSize.lg, color: Colors.bg },
});
