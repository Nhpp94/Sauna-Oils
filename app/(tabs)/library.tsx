import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Blend } from '../../data/blends';
import { useMyOils } from '../../hooks/useMyOils';
import { useRemoteData } from '../../context/RemoteDataContext';
import { useMyIncense } from '../../hooks/useMyIncense';
import { useCustomLibrary } from '../../context/CustomLibraryContext';
import { OilCard } from '../../components/OilCard';
import { BlendCard } from '../../components/BlendCard';
import { IncenseCard } from '../../components/IncenseCard';
import { AddOilModal } from '../../components/AddOilModal';
import { AddBlendModal } from '../../components/AddBlendModal';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import GrainOverlay from '../../components/GrainOverlay';
import { ALL_CATEGORIES, CATEGORY_META, Category } from '../../constants/categories';
import { NOTE_ICONS } from '../../constants/icons';

const NOTE_LABEL: Record<string, string> = { top: 'Top note', middle: 'Heart note', base: 'Base note' };

type Tab = 'oils' | 'blends' | 'incense';

export default function LibraryScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { ownedIds, isOwned, toggleOwned } = useMyOils();
  const { ownedIncenseIds, isOwnedIncense, toggleOwnedIncense } = useMyIncense();
  const { customOils, customBlends, addCustomOil, removeCustomOil, addCustomBlend, removeCustomBlend } = useCustomLibrary();
  const { oils: remoteOils, blends: remoteBlends, incense: remoteIncense } = useRemoteData();
  const [activeTab, setActiveTab] = useState<Tab>('oils');

  useEffect(() => {
    if (tab === 'incense' || tab === 'blends' || tab === 'oils') {
      setActiveTab(tab);
    }
  }, [tab]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeNote, setActiveNote] = useState<'top' | 'middle' | 'base' | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'category' | 'note' | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  function toggleDropdown(key: 'category' | 'note') {
    setOpenDropdown(prev => prev === key ? null : key);
  }
  const [showAddOil, setShowAddOil] = useState(false);
  const [showAddBlend, setShowAddBlend] = useState(false);

  const allOils = useMemo(() => [...remoteOils, ...customOils], [remoteOils, customOils]);
  const allBlends = useMemo(() => [...remoteBlends, ...customBlends], [remoteBlends, customBlends]);

  const filteredOils = useMemo(() => {
    return allOils.filter(oil => {
      const matchSearch =
        !search ||
        oil.name.toLowerCase().includes(search.toLowerCase()) ||
        oil.category.toLowerCase().includes(search.toLowerCase()) ||
        oil.benefits.some(b => b.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = !activeCategory || oil.category === activeCategory;
      const matchNote = !activeNote || oil.note === activeNote;
      return matchSearch && matchCategory && matchNote;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [allOils, search, activeCategory, activeNote]);

  const filteredBlends = useMemo(() => {
    return allBlends.filter(blend => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        blend.name.toLowerCase().includes(q) ||
        blend.description.toLowerCase().includes(q) ||
        blend.benefits.some(b => b.toLowerCase().includes(q)) ||
        blend.oils.some(o => o.name.toLowerCase().includes(q))
      );
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [allBlends, search]);

  const filteredIncense = useMemo(() => {
    return remoteIncense.filter(i => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        i.name.toLowerCase().includes(q) ||
        i.origin.toLowerCase().includes(q) ||
        i.form.toLowerCase().includes(q) ||
        i.benefits.some(b => b.toLowerCase().includes(q))
      );
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [search]);

  const handleDeleteOil = (oilId: string, oilName: string) => {
    Alert.alert(
      'Remove Oil',
      `Remove "${oilName}" from your library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeCustomOil(oilId) },
      ]
    );
  };

  const handleDeleteBlend = (blendId: string, blendName: string) => {
    Alert.alert(
      'Remove Blend',
      `Remove "${blendName}" from your library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeCustomBlend(blendId) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <GrainOverlay />
      {/* Segmented control */}
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'oils' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('oils')}
        >
          <Ionicons name="leaf-outline" size={14} color={activeTab === 'oils' ? Colors.gold : Colors.textMuted} />
          <Text style={[styles.segmentText, activeTab === 'oils' && styles.segmentTextActive]}>
            Oils
          </Text>
          <View style={[styles.segmentBadge, activeTab === 'oils' && styles.segmentBadgeActive]}>
            <Text style={[styles.segmentBadgeText, activeTab === 'oils' && styles.segmentBadgeTextActive]}>
              {allOils.length}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'blends' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('blends')}
        >
          <Ionicons name="layers-outline" size={14} color={activeTab === 'blends' ? Colors.gold : Colors.textMuted} />
          <Text style={[styles.segmentText, activeTab === 'blends' && styles.segmentTextActive]}>
            Blends
          </Text>
          <View style={[styles.segmentBadge, activeTab === 'blends' && styles.segmentBadgeActive]}>
            <Text style={[styles.segmentBadgeText, activeTab === 'blends' && styles.segmentBadgeTextActive]}>
              {allBlends.length}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'incense' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('incense')}
        >
          <Ionicons name="flame-outline" size={14} color={activeTab === 'incense' ? Colors.gold : Colors.textMuted} />
          <Text style={[styles.segmentText, activeTab === 'incense' && styles.segmentTextActive]}>
            Incense
          </Text>
          <View style={[styles.segmentBadge, activeTab === 'incense' && styles.segmentBadgeActive]}>
            <Text style={[styles.segmentBadgeText, activeTab === 'incense' && styles.segmentBadgeTextActive]}>
              {remoteIncense.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={14} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'oils' ? 'Search oils, benefits...' : activeTab === 'blends' ? 'Search blends, oils...' : 'Search incense, origin...'}
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters — only for oils tab */}
      {activeTab === 'oils' && (
        <View style={styles.filterArea}>
          {/* Pill row */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterPill, !!activeCategory && styles.filterPillActive]}
              onPress={() => toggleDropdown('category')}
            >
              <Text style={[styles.filterPillText, !!activeCategory && styles.filterPillTextActive]}>
                {activeCategory ? CATEGORY_META[activeCategory].label : 'Category'}
              </Text>
              <Ionicons name={openDropdown === 'category' ? 'chevron-up' : 'chevron-down'} size={12} color={activeCategory ? Colors.gold : Colors.textMuted} />
              {activeCategory && (
                <TouchableOpacity onPress={() => { setActiveCategory(null); setOpenDropdown(null); }} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Ionicons name="close-circle" size={14} color={Colors.gold} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, !!activeNote && styles.filterPillActive]}
              onPress={() => toggleDropdown('note')}
            >
              <Text style={[styles.filterPillText, !!activeNote && styles.filterPillTextActive]}>
                {activeNote ? NOTE_LABEL[activeNote] : 'Note'}
              </Text>
              <Ionicons name={openDropdown === 'note' ? 'chevron-up' : 'chevron-down'} size={12} color={activeNote ? Colors.gold : Colors.textMuted} />
              {activeNote && (
                <TouchableOpacity onPress={() => { setActiveNote(null); setOpenDropdown(null); }} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Ionicons name="close-circle" size={14} color={Colors.gold} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          {/* Category dropdown */}
          {openDropdown === 'category' && (
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.dropdownOption} onPress={() => { setActiveCategory(null); setOpenDropdown(null); }}>
                <Text style={[styles.dropdownOptionText, !activeCategory && styles.dropdownOptionActive]}>All categories</Text>
                {!activeCategory && <Ionicons name="checkmark" size={14} color={Colors.gold} />}
              </TouchableOpacity>
              {ALL_CATEGORIES.map((cat, i) => {
                const meta = CATEGORY_META[cat];
                const active = activeCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.dropdownOption, i === ALL_CATEGORIES.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => { setActiveCategory(cat); setOpenDropdown(null); }}
                  >
                    <Ionicons name={meta.icon as any} size={14} color={meta.color} />
                    <Text style={[styles.dropdownOptionText, { color: meta.color }, active && { fontFamily: Typography.sansMedium }]}>{meta.label}</Text>
                    {active && <Ionicons name="checkmark" size={14} color={meta.color} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Note dropdown */}
          {openDropdown === 'note' && (
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.dropdownOption} onPress={() => { setActiveNote(null); setOpenDropdown(null); }}>
                <Text style={[styles.dropdownOptionText, !activeNote && styles.dropdownOptionActive]}>All notes</Text>
                {!activeNote && <Ionicons name="checkmark" size={14} color={Colors.gold} />}
              </TouchableOpacity>
              {(['top', 'middle', 'base'] as const).map((note, i) => {
                const active = activeNote === note;
                return (
                  <TouchableOpacity
                    key={note}
                    style={[styles.dropdownOption, i === 2 && { borderBottomWidth: 0 }]}
                    onPress={() => { setActiveNote(note); setOpenDropdown(null); }}
                  >
                    <Ionicons name={NOTE_ICONS[note] as any} size={14} color={active ? Colors.gold : Colors.textMuted} />
                    <Text style={[styles.dropdownOptionText, active && styles.dropdownOptionActive]}>{NOTE_LABEL[note]}</Text>
                    {active && <Ionicons name="checkmark" size={14} color={Colors.gold} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Count */}
      <Text style={styles.resultCount}>
        {activeTab === 'oils'
          ? `${filteredOils.length} oils${customOils.length > 0 ? ` · ${customOils.length} custom` : ''}`
          : activeTab === 'blends'
          ? `${filteredBlends.length} blends${customBlends.length > 0 ? ` · ${customBlends.length} custom` : ''}`
          : `${filteredIncense.length} incense`}
      </Text>

      {/* Content */}
      {activeTab === 'oils' ? (
        <FlatList
          key="oils"
          data={filteredOils}
          keyExtractor={item => item.id}
          extraData={ownedIds}
          contentContainerStyle={styles.blendList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isCustom = item.id.startsWith('custom_');
            return (
              <View>
                <OilCard
                  oil={item}
                  onPress={() => router.push(`/oil/${item.id}`)}
                  owned={isOwned(item.id)}
                  onToggleOwned={() => toggleOwned(item.id)}
                />
                {isCustom && (
                  <View style={styles.customBadgeRow}>
                    <View style={styles.customBadge}>
                      <Text style={styles.customBadgeText}>Custom</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteOil(item.id, item.name)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="trash-outline" size={13} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      ) : activeTab === 'blends' ? (
        <FlatList
          key="blends"
          data={filteredBlends}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.blendList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isCustom = item.id.startsWith('custom_blend_');
            return (
              <View>
                <BlendCard
                  blend={item}
                  onPress={() => router.push(`/blend/${item.id}`)}
                />
                {isCustom && (
                  <View style={styles.blendCustomRow}>
                    <View style={styles.customBadge}>
                      <Text style={styles.customBadgeText}>Custom</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteBlend(item.id, item.name)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="trash-outline" size={13} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      ) : (
        <FlatList
          key="incense"
          data={filteredIncense}
          keyExtractor={item => item.id}
          extraData={ownedIncenseIds}
          contentContainerStyle={styles.blendList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <IncenseCard
              incense={item}
              onPress={() => router.push(`/incense/${item.id}`)}
              owned={isOwnedIncense(item.id)}
              onToggleOwned={() => toggleOwnedIncense(item.id)}
            />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddMenu(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={26} color={Colors.bg} />
      </TouchableOpacity>

      {/* Add menu modal */}
      <Modal visible={showAddMenu} transparent animationType="fade" onRequestClose={() => setShowAddMenu(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowAddMenu(false)}>
          <View style={styles.menuSheet}>
            <Text style={styles.menuTitle}>Add to Library</Text>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => { setShowAddMenu(false); setTimeout(() => setShowAddOil(true), 300); }}
            >
              <View style={styles.menuOptionIcon}>
                <Ionicons name="leaf-outline" size={20} color={Colors.gold} />
              </View>
              <View style={styles.menuOptionText}>
                <Text style={styles.menuOptionLabel}>Add Single Oil</Text>
                <Text style={styles.menuOptionDesc}>Create a custom essential oil</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => { setShowAddMenu(false); setTimeout(() => setShowAddBlend(true), 300); }}
            >
              <View style={styles.menuOptionIcon}>
                <Ionicons name="layers-outline" size={20} color={Colors.gold} />
              </View>
              <View style={styles.menuOptionText}>
                <Text style={styles.menuOptionLabel}>Create Blend</Text>
                <Text style={styles.menuOptionDesc}>Mix oils into your own blend</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Oil Modal */}
      <AddOilModal
        visible={showAddOil}
        onClose={() => setShowAddOil(false)}
        onSave={(oil) => { addCustomOil(oil); setShowAddOil(false); }}
      />

      {/* Add Blend Modal */}
      <AddBlendModal
        visible={showAddBlend}
        onClose={() => setShowAddBlend(false)}
        onSave={(blend) => { addCustomBlend(blend); setShowAddBlend(false); }}
        customOils={customOils}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  segmentRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
    gap: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  segmentBtnActive: {
    backgroundColor: Colors.goldDim,
  },
  segmentText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  segmentTextActive: {
    color: Colors.gold,
  },
  segmentBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  segmentBadgeActive: {
    backgroundColor: 'rgba(212,151,58,0.25)',
  },
  segmentBadgeText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
  },
  segmentBadgeTextActive: {
    color: Colors.gold,
  },
  searchRow: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    fontFamily: Typography.sans,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  filterArea: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
    zIndex: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  filterPillActive: {
    backgroundColor: Colors.goldDim,
    borderColor: Colors.gold,
  },
  filterPillText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: Colors.gold,
  },
  dropdown: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownOptionText: {
    flex: 1,
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  dropdownOptionActive: {
    color: Colors.gold,
    fontFamily: Typography.sansMedium,
  },
  resultCount: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  grid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 80,
  },
  row: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardWrapper: {
    flex: 1,
  },
  customBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  customBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(212,151,58,0.15)',
    borderWidth: 1,
    borderColor: Colors.goldDim,
  },
  customBadgeText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xxs,
    color: Colors.gold,
  },
  blendList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 80,
    gap: 4,
  },
  blendCustomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 4,
    marginBottom: 8,
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  // Add menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.sm,
  },
  menuTitle: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  menuOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOptionText: {
    flex: 1,
  },
  menuOptionLabel: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  menuOptionDesc: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
