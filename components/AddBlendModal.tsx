import React, { useState, useMemo } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EssentialOil } from '../data/oils';
import { useRemoteData } from '../context/RemoteDataContext';
import { Blend, BlendOil } from '../data/blends';
import { Colors, Typography, FontSize, Spacing, Radius } from '../constants/theme';
import { CATEGORY_META } from '../constants/categories';
import { OilIcon } from './OilIcon';

interface SelectedOil {
  oil: EssentialOil;
  drops: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (blend: Blend) => void;
  customOils?: EssentialOil[];
}

export function AddBlendModal({ visible, onClose, onSave, customOils = [] }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedOils, setSelectedOils] = useState<SelectedOil[]>([]);
  const [search, setSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const { oils: remoteOils } = useRemoteData();

  const allOils = useMemo(() => [...remoteOils, ...customOils], [remoteOils, customOils]);

  const filteredOils = useMemo(() => {
    const q = search.toLowerCase();
    return allOils.filter(o =>
      !selectedOils.find(s => s.oil.id === o.id) &&
      (o.name.toLowerCase().includes(q) || o.category.toLowerCase().includes(q))
    );
  }, [allOils, selectedOils, search]);

  const addOil = (oil: EssentialOil) => {
    setSelectedOils(prev => [...prev, { oil, drops: 3 }]);
    setSearch('');
    setShowPicker(false);
  };

  const removeOil = (oilId: string) => {
    setSelectedOils(prev => prev.filter(s => s.oil.id !== oilId));
  };

  const changeDrops = (oilId: string, delta: number) => {
    setSelectedOils(prev => prev.map(s => {
      if (s.oil.id !== oilId) return s;
      const next = Math.max(1, Math.min(10, s.drops + delta));
      return { ...s, drops: next };
    }));
  };

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Name required', 'Please enter a name for your blend.'); return; }
    if (selectedOils.length < 2) { Alert.alert('Add oils', 'A blend needs at least 2 oils.'); return; }

    const oils: BlendOil[] = selectedOils.map(s => ({ id: s.oil.id, name: s.oil.name, drops: s.drops }));
    const vibes = [...new Set(selectedOils.flatMap(s => s.oil.vibes))];
    const timeOfDay = [...new Set(selectedOils.flatMap(s => s.oil.timeOfDay))];
    const benefits = [...new Set(selectedOils.flatMap(s => s.oil.benefits))].slice(0, 4);

    const blend: Blend = {
      id: `custom_blend_${Date.now()}`,
      name: name.trim(),
      description: description.trim() || `A custom blend of ${selectedOils.map(s => s.oil.name).join(', ')}.`,
      saunaNote: '',
      oils,
      vibes: vibes as any,
      timeOfDay: timeOfDay as any,
      benefits,
      color: selectedOils[0]?.oil.color ?? Colors.gold,
      emoji: '⭐',
      precautions: [],
    };

    onSave(blend);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSelectedOils([]);
    setSearch('');
    setShowPicker(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Blend</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Name */}
            <View style={styles.nameRow}>
              <TextInput
                style={[styles.input, styles.nameInput]}
                value={name}
                onChangeText={setName}
                placeholder="Blend name"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
              />
            </View>

            {/* Description */}
            <TextInput
              style={[styles.input, styles.descInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description (optional)"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={2}
            />

            {/* Selected oils */}
            <Text style={styles.label}>Oils in blend</Text>
            {selectedOils.length === 0 ? (
              <View style={styles.emptyOils}>
                <Ionicons name="leaf-outline" size={24} color={Colors.textMuted} />
                <Text style={styles.emptyOilsText}>No oils added yet</Text>
              </View>
            ) : (
              <View style={styles.selectedOilsList}>
                {selectedOils.map(s => {
                  const meta = CATEGORY_META[s.oil.category];
                  return (
                    <View key={s.oil.id} style={styles.selectedOilRow}>
                      <View style={[styles.selectedOilColor, { backgroundColor: s.oil.color }]} />
                      <View style={{ paddingVertical: Spacing.md }}><OilIcon oil={s.oil} size={20} /></View>
                      <View style={styles.selectedOilInfo}>
                        <Text style={styles.selectedOilName}>{s.oil.name}</Text>
                        <Text style={[styles.selectedOilCat, { color: meta.color }]}>{meta.label}</Text>
                      </View>
                      <View style={styles.dropsStepper}>
                        <TouchableOpacity style={styles.stepperBtn} onPress={() => changeDrops(s.oil.id, -1)}>
                          <Ionicons name="remove" size={14} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={styles.dropsCount}>{s.drops}</Text>
                        <TouchableOpacity style={styles.stepperBtn} onPress={() => changeDrops(s.oil.id, 1)}>
                          <Ionicons name="add" size={14} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={styles.dropsLabel}>drops</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeOil(s.oil.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Add oil button */}
            <TouchableOpacity style={styles.addOilBtn} onPress={() => setShowPicker(true)}>
              <Ionicons name="add" size={16} color={Colors.gold} />
              <Text style={styles.addOilBtnText}>Add Oil</Text>
            </TouchableOpacity>

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Save */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Save Blend</Text>
              <Ionicons name="checkmark" size={18} color={Colors.bg} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Oil Picker overlay */}
      <Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPicker(false)}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Oil</Text>
            <TouchableOpacity onPress={() => setShowPicker(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.pickerSearch}>
            <Ionicons name="search-outline" size={14} color={Colors.textMuted} />
            <TextInput
              style={styles.pickerSearchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search oils..."
              placeholderTextColor={Colors.textMuted}
              autoFocus
              autoCapitalize="none"
            />
          </View>
          <FlatList
            data={filteredOils}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.pickerList}
            renderItem={({ item }) => {
              const meta = CATEGORY_META[item.category];
              return (
                <TouchableOpacity style={styles.pickerRow} onPress={() => addOil(item)} activeOpacity={0.7}>
                  <View style={[styles.pickerRowColor, { backgroundColor: item.color }]} />
                  <View style={{ paddingVertical: Spacing.md }}><OilIcon oil={item} size={20} /></View>
                  <View style={styles.pickerRowInfo}>
                    <Text style={styles.pickerRowName}>{item.name}</Text>
                    <Text style={[styles.pickerRowCat, { color: meta.color }]}>{meta.label} · {item.note}</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color={Colors.gold} />
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
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
    marginBottom: Spacing.sm,
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
  descInput: {
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    minHeight: 72,
    textAlignVertical: 'top',
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
  emptyOils: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyOilsText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  selectedOilsList: {
    gap: Spacing.xs,
  },
  selectedOilRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    paddingRight: Spacing.md,
    gap: Spacing.sm,
  },
  selectedOilColor: {
    width: 4,
    alignSelf: 'stretch',
  },
  selectedOilInfo: {
    flex: 1,
  },
  selectedOilName: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  selectedOilCat: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
  },
  dropsStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropsCount: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.md,
    color: Colors.gold,
    minWidth: 18,
    textAlign: 'center',
  },
  dropsLabel: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  addOilBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.goldDim,
    marginTop: Spacing.sm,
  },
  addOilBtnText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.md,
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
  // Picker styles
  pickerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerSearchInput: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    fontFamily: Typography.sans,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  pickerList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    gap: 2,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    paddingRight: Spacing.md,
    marginBottom: 4,
    gap: Spacing.sm,
  },
  pickerRowColor: {
    width: 4,
    alignSelf: 'stretch',
    minHeight: 48,
  },
  pickerRowInfo: {
    flex: 1,
  },
  pickerRowName: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  pickerRowCat: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    textTransform: 'capitalize',
  },
});
