import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudio } from '../../context/StudioContext';
import { useRemoteData } from '../../context/RemoteDataContext';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import GrainOverlay from '../../components/GrainOverlay';
import { CATEGORY_META } from '../../constants/categories';
import { OilIcon } from '../../components/OilIcon';
import type { EssentialOil } from '../../data/oils';

type ManageTab = 'catalog' | 'add';

export default function ManageStudioScreen() {
  const router = useRouter();
  const { studioOils, addOilToStudio, removeOilFromStudio } = useStudio();
  const { oils: allOils } = useRemoteData();
  const [activeTab, setActiveTab] = useState<ManageTab>('catalog');
  const [search, setSearch] = useState('');

  const studioOilIds = useMemo(() => new Set(studioOils.map(o => o.id)), [studioOils]);

  const filteredOils = useMemo(() => {
    const q = search.toLowerCase();
    return allOils.filter(o =>
      !studioOilIds.has(o.id) &&
      (!q || o.name.toLowerCase().includes(q) || o.category.toLowerCase().includes(q))
    );
  }, [allOils, studioOilIds, search]);

  function handleRemove(oil: EssentialOil) {
    Alert.alert('Remove Oil', `Remove "${oil.name}" from the studio catalog?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeOilFromStudio(oil.id) },
    ]);
  }

  async function handleAdd(oil: EssentialOil) {
    await addOilToStudio(oil);
    setSearch('');
  }

  return (
    <View style={styles.container}>
      <GrainOverlay />

      {/* Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.gold} />
          <Text style={styles.backText}>Studio</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Manage Oils</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Segment tabs */}
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segmentTab, activeTab === 'catalog' && styles.segmentTabActive]}
          onPress={() => setActiveTab('catalog')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentLabel, activeTab === 'catalog' && styles.segmentLabelActive]}>
            Catalog · {studioOils.length}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentTab, activeTab === 'add' && styles.segmentTabActive]}
          onPress={() => setActiveTab('add')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentLabel, activeTab === 'add' && styles.segmentLabelActive]}>
            Add oils
          </Text>
        </TouchableOpacity>
      </View>

      {/* Catalog tab — current studio oils */}
      {activeTab === 'catalog' && (
        <FlatList
          data={studioOils}
          keyExtractor={o => o.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyState}>No oils in the catalog yet.{'\n'}Switch to "Add oils" to get started.</Text>
          }
          renderItem={({ item }) => {
            const meta = CATEGORY_META[item.category];
            return (
              <View style={styles.oilRow}>
                <View style={[styles.accentBar, { backgroundColor: meta.color }]} />
                <View style={styles.iconWrap}>
                  <OilIcon oil={item} size={26} />
                </View>
                <View style={styles.oilInfo}>
                  <Text style={styles.oilName}>{item.name}</Text>
                  <View style={styles.oilMeta}>
                    <Ionicons name={meta.icon as any} size={10} color={meta.color} />
                    <Text style={styles.oilMetaText}>{meta.label} · {item.note} note</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemove(item)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove-circle-outline" size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* Add tab — browse all oils not yet in studio */}
      {activeTab === 'add' && (
        <>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={16} color={Colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search oils..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={filteredOils}
            keyExtractor={o => o.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyState}>
                {search ? 'No oils match your search' : 'All oils are already in the catalog'}
              </Text>
            }
            renderItem={({ item }) => {
              const meta = CATEGORY_META[item.category];
              return (
                <View style={styles.oilRow}>
                  <View style={[styles.accentBar, { backgroundColor: meta.color }]} />
                  <View style={styles.iconWrap}>
                    <OilIcon oil={item} size={26} />
                  </View>
                  <View style={styles.oilInfo}>
                    <Text style={styles.oilName}>{item.name}</Text>
                    <View style={styles.oilMeta}>
                      <Ionicons name={meta.icon as any} size={10} color={meta.color} />
                      <Text style={styles.oilMetaText}>{meta.label} · {item.note} note</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleAdd(item)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle-outline" size={22} color={Colors.gold} />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 60 },
  backText: { fontFamily: Typography.sansMedium, fontSize: FontSize.md, color: Colors.gold },
  navTitle: { fontFamily: Typography.serifBold, fontSize: FontSize.xl, color: Colors.textPrimary },
  segmentRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  segmentTab: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  segmentTabActive: { borderColor: Colors.gold, backgroundColor: Colors.goldDim },
  segmentLabel: { fontFamily: Typography.sansMedium, fontSize: FontSize.sm, color: Colors.textMuted },
  segmentLabelActive: { color: Colors.gold },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  emptyState: { fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl, lineHeight: FontSize.md * 1.6 },
  oilRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, paddingRight: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.sm },
  accentBar: { width: 3, height: 40, borderRadius: 2 },
  iconWrap: { width: 30, alignItems: 'center', justifyContent: 'center' },
  oilInfo: { flex: 1 },
  oilName: { fontFamily: Typography.sansMedium, fontSize: FontSize.md, color: Colors.textPrimary },
  oilMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  oilMetaText: { fontFamily: Typography.sans, fontSize: FontSize.xs, color: Colors.textMuted },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchIcon: { marginRight: 2 },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontFamily: Typography.sans,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
});
