import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, FlatList, TextInput,
} from 'react-native';
import { EssentialOil, Vibe, TimeOfDay, NoteType } from '../data/oils';
import { Blend, BLENDS } from '../data/blends';
import { Incense, INCENSE } from '../data/incense';
import { SwapCandidate } from '../data/recommendations';
import { Colors, Typography, FontSize, Spacing, Radius } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_META, Category, ALL_CATEGORIES } from '../constants/categories';
import { FORM_META } from '../constants/incenseForms';
import { VIBE_COLORS, VIBE_ICONS, NOTE_ICONS } from '../constants/icons';
import { OilIcon } from './OilIcon';
import { BotanicalIcon } from './BotanicalIcon';
import { OIL_ICONS } from '../constants/oilIcons';

function blendBotanical(blend: Blend): string {
  if (blend.id.startsWith('custom_blend_')) return 'star';
  return OIL_ICONS[blend.oils[0]?.id]?.botanical ?? 'sprout';
}

const INCENSE_FORM_BOTANICALS: Record<string, string> = {
  wood: 'wood-stick', resin: 'resin-drop', herb: 'herb-bundle',
  stick: 'lavender-sprig', cone: 'lavender-sprig',
};
const INCENSE_BOTANICALS: Record<string, string> = {
  'palo-santo': 'wood-stick', 'white-sage': 'herb-bundle',
  'frankincense-resin': 'resin-drop', 'myrrh-resin': 'resin-drop',
  'copal-resin': 'resin-drop', 'cedar-chips': 'pine-branch',
  'mugwort': 'herb-bundle', 'dragons-blood': 'resin-drop',
  'benzoin-resin': 'resin-drop', 'sandalwood-chips': 'sandalwood-ring',
  'chamomile-flowers': 'chamomile',
};

type Tab = 'oils' | 'blends' | 'incense';

const FORM_LABEL: Record<string, string> = {
  wood: 'Wood', resin: 'Resin', herb: 'Herb', stick: 'Stick', cone: 'Cone',
};
const NOTE_LABEL: Record<string, string> = { top: 'Top note', middle: 'Heart note', base: 'Base note' };

interface Props {
  visible: boolean;
  oilToReplace: EssentialOil | null;
  suggestion: SwapCandidate | null;
  browseOils: (EssentialOil & { compatibilityScore: number })[];
  ownedIds: Set<string>;
  ownedIncenseIds: Set<string>;
  vibe: Vibe | null;
  time: TimeOfDay | null;
  initialTab?: Tab;
  customBlends?: Blend[];
  onUseOil: (oil: EssentialOil) => void;
  onUseBlend: (blend: Blend) => void;
  onUseIncense: (incense: Incense) => void;
  onClose: () => void;
}

export function SwapModal({ visible, oilToReplace, suggestion, browseOils, customBlends, ownedIds, ownedIncenseIds, initialTab, onUseOil, onUseBlend, onUseIncense, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('oils');
  const [search, setSearch] = useState('');
  const [kitOnly, setKitOnly] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null);
  const [noteFilter, setNoteFilter] = useState<NoteType | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'category' | 'note' | null>(null);
  const [dropdownTop, setDropdownTop] = useState(0);

  function toggleDropdown(key: 'category' | 'note') {
    setOpenDropdown(prev => prev === key ? null : key);
  }

  useEffect(() => {
    if (visible) {
      setTab(initialTab ?? (oilToReplace === null ? 'blends' : 'oils'));
      setSearch('');
      setCategoryFilter(null);
      setNoteFilter(null);
      setOpenDropdown(null);
    }
  }, [visible, oilToReplace, initialTab]);

  const visibleSuggestion = kitOnly && suggestion && !ownedIds.has(suggestion.oil.id) ? null : suggestion;

  const filteredOils = browseOils.filter(o => {
    if (kitOnly && !ownedIds.has(o.id)) return false;
    if (categoryFilter && o.category !== categoryFilter) return false;
    if (noteFilter && o.note !== noteFilter) return false;
    const q = search.toLowerCase();
    return !q || o.name.toLowerCase().includes(q) || o.category.toLowerCase().includes(q);
  }).sort((a, b) => a.name.localeCompare(b.name));

  const suggestionId = visibleSuggestion?.oil.id;
  const bestMatchOils = filteredOils.filter(o => o.compatibilityScore >= 5 && o.id !== suggestionId);
  const browseOilsList = filteredOils.filter(o => o.compatibilityScore < 5 && o.id !== suggestionId);

  type OilListItem =
    | { type: 'oil'; oil: EssentialOil & { compatibilityScore: number } }
    | { type: 'header'; title: string };
  const flatOilItems: OilListItem[] = bestMatchOils.length > 0
    ? [
        { type: 'header', title: 'Best Matches' },
        ...bestMatchOils.map(o => ({ type: 'oil' as const, oil: o })),
        { type: 'header', title: 'Browse Oils' },
        ...browseOilsList.map(o => ({ type: 'oil' as const, oil: o })),
      ]
    : browseOilsList.map(o => ({ type: 'oil' as const, oil: o }));

  const sortedBlends = [...BLENDS, ...(customBlends ?? [])]
    .filter(b => !kitOnly || b.oils.every(bo => ownedIds.has(bo.id)))
    .filter(b => {
      const q = search.toLowerCase();
      return !q || b.name.toLowerCase().includes(q) || b.benefits.some(x => x.toLowerCase().includes(q));
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const sortedIncense = [...INCENSE]
    .filter(i => !kitOnly || ownedIncenseIds.has(i.id))
    .filter(i => {
      const q = search.toLowerCase();
      return !q || i.name.toLowerCase().includes(q) || i.origin.toLowerCase().includes(q);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={26} color="#f0e4c8" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Swap</Text>
            {oilToReplace ? (
              <View style={styles.subtitleRow}>
                <OilIcon oil={oilToReplace} size={14} />
                <Text style={styles.subtitle}> {oilToReplace.name}</Text>
              </View>
            ) : (
              <Text style={styles.subtitle}>Replace blend slot</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.kitToggle, kitOnly && styles.kitToggleActive]}
            onPress={() => setKitOnly(v => !v)}
            activeOpacity={0.75}
          >
            <Ionicons name="briefcase-outline" size={13} color={kitOnly ? Colors.gold : Colors.textMuted} />
            <View style={[styles.kitDot, kitOnly && styles.kitDotActive]} />
          </TouchableOpacity>
        </View>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {(['oils', 'blends', 'incense'] as Tab[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => { setTab(t); setSearch(''); }}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={14} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder={tab === 'oils' ? 'Search oils...' : tab === 'blends' ? 'Search blends...' : 'Search incense...'}
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

        {/* Oil filters */}
        {tab === 'oils' && (
          <View
            style={styles.filterArea}
            onLayout={(e) => setDropdownTop(e.nativeEvent.layout.y + e.nativeEvent.layout.height)}
          >
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.filterPill, !!categoryFilter && styles.filterPillActive]}
                onPress={() => toggleDropdown('category')}
              >
                <Text style={[styles.filterPillText, !!categoryFilter && styles.filterPillTextActive]}>
                  {categoryFilter ? CATEGORY_META[categoryFilter].label : 'Category'}
                </Text>
                <Ionicons name={openDropdown === 'category' ? 'chevron-up' : 'chevron-down'} size={12} color={categoryFilter ? Colors.gold : Colors.textMuted} />
                {categoryFilter && (
                  <TouchableOpacity onPress={() => { setCategoryFilter(null); setOpenDropdown(null); }} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Ionicons name="close-circle" size={14} color={Colors.gold} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterPill, !!noteFilter && styles.filterPillActive]}
                onPress={() => toggleDropdown('note')}
              >
                <Text style={[styles.filterPillText, !!noteFilter && styles.filterPillTextActive]}>
                  {noteFilter ? NOTE_LABEL[noteFilter] : 'Note'}
                </Text>
                <Ionicons name={openDropdown === 'note' ? 'chevron-up' : 'chevron-down'} size={12} color={noteFilter ? Colors.gold : Colors.textMuted} />
                {noteFilter && (
                  <TouchableOpacity onPress={() => { setNoteFilter(null); setOpenDropdown(null); }} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Ionicons name="close-circle" size={14} color={Colors.gold} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Dropdown overlay — absolutely positioned so it never affects SectionList height */}
        {tab === 'oils' && openDropdown && dropdownTop > 0 && (
          <View style={[styles.dropdownOverlay, { top: dropdownTop }]}>
            {openDropdown === 'category' && (
              <View style={styles.dropdown}>
                <TouchableOpacity style={styles.dropdownOption} onPress={() => { setCategoryFilter(null); setOpenDropdown(null); }}>
                  <Text style={[styles.dropdownOptionText, !categoryFilter && styles.dropdownOptionActive]}>All categories</Text>
                  {!categoryFilter && <Ionicons name="checkmark" size={14} color={Colors.gold} />}
                </TouchableOpacity>
                {ALL_CATEGORIES.map((cat, i) => {
                  const meta = CATEGORY_META[cat];
                  const active = categoryFilter === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.dropdownOption, i === ALL_CATEGORIES.length - 1 && { borderBottomWidth: 0 }]}
                      onPress={() => { setCategoryFilter(cat); setOpenDropdown(null); }}
                    >
                      <Ionicons name={meta.icon as any} size={14} color={meta.color} />
                      <Text style={[styles.dropdownOptionText, { color: meta.color }, active && { fontFamily: Typography.sansMedium }]}>{meta.label}</Text>
                      {active && <Ionicons name="checkmark" size={14} color={meta.color} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            {openDropdown === 'note' && (
              <View style={styles.dropdown}>
                <TouchableOpacity style={styles.dropdownOption} onPress={() => { setNoteFilter(null); setOpenDropdown(null); }}>
                  <Text style={[styles.dropdownOptionText, !noteFilter && styles.dropdownOptionActive]}>All notes</Text>
                  {!noteFilter && <Ionicons name="checkmark" size={14} color={Colors.gold} />}
                </TouchableOpacity>
                {(['top', 'middle', 'base'] as NoteType[]).map((note, i) => {
                  const active = noteFilter === note;
                  return (
                    <TouchableOpacity
                      key={note}
                      style={[styles.dropdownOption, i === 2 && { borderBottomWidth: 0 }]}
                      onPress={() => { setNoteFilter(note); setOpenDropdown(null); }}
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

        {/* Oils tab */}
        {tab === 'oils' && (
          <FlatList
            style={{ flex: 1 }}
            data={flatOilItems}
            keyExtractor={(item, index) => item.type === 'oil' ? item.oil.id : `header-${index}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              if (item.type === 'header') {
                return (
                  <View style={[styles.sectionLabelRow, { marginTop: Spacing.md }]}>
                    <Text style={styles.sectionLabel}>{item.title}</Text>
                  </View>
                );
              }
              const oil = item.oil;
              const meta = CATEGORY_META[oil.category as Category];
              return (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => onUseOil(oil)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.rowAccent, { backgroundColor: meta.color }]} />
                  <View style={{ width: 28, alignItems: 'center' }}>
                    <OilIcon oil={oil} size={20} />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowName}>{oil.name}</Text>
                    <View style={styles.rowMetaRow}>
                      <Text style={styles.rowMeta}>{meta.label} · {oil.note} note</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Blends tab */}
        {tab === 'blends' && (
          <FlatList
            style={{ flex: 1 }}
            data={sortedBlends}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => onUseBlend(item)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.rowAccent, { backgroundColor: Colors.gold }]} />
                  <BotanicalIcon botanicalKey={blendBotanical(item)} size={26} color="rgba(255,255,255,0.85)" />
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowName}>{item.name}</Text>
                    <View style={styles.rowMetaRow}>
                      <Text style={styles.rowMeta}>{item.oils.length} oils</Text>
                      {item.vibes.slice(0, 2).map(v => (
                        <Ionicons key={v} name={VIBE_ICONS[v] as any} size={11} color={VIBE_COLORS[v] ?? Colors.textMuted} />
                      ))}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Incense tab */}
        {tab === 'incense' && (
          <FlatList
            style={{ flex: 1 }}
            data={sortedIncense}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => onUseIncense(item)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.rowAccent, { backgroundColor: FORM_META[item.form].color }]} />
                  <BotanicalIcon botanicalKey={INCENSE_BOTANICALS[item.id] ?? INCENSE_FORM_BOTANICALS[item.form] ?? 'resin-drop'} size={26} color="rgba(255,255,255,0.85)" />
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowName}>{item.name}</Text>
                    <View style={styles.rowMetaRow}>
                      <Text style={styles.rowMeta}>{FORM_LABEL[item.form]} · {item.origin}</Text>
                      {item.vibes.slice(0, 2).map(v => (
                        <Ionicons key={v} name={VIBE_ICONS[v] as any} size={11} color={VIBE_COLORS[v] ?? Colors.textMuted} />
                      ))}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xxl,
    color: Colors.textPrimary,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subtitle: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  kitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: 40,
    height: 40,
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  kitToggleActive: {
    borderColor: Colors.goldDim,
    backgroundColor: Colors.goldDim,
  },
  kitDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  kitDotActive: {
    backgroundColor: Colors.gold,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
    gap: 3,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  tabBtnActive: {
    backgroundColor: Colors.goldDim,
  },
  tabBtnText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  tabBtnTextActive: {
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
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 40,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontFamily: Typography.sansBold,
    fontSize: FontSize.xs,
    color: Colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  suggestionSection: {
    marginBottom: Spacing.sm,
  },
  suggestionCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
    marginBottom: Spacing.md,
  },
  suggestionColorBar: {
    height: 3,
  },
  suggestionBody: {
    padding: Spacing.md,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  suggestionName: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  suggestionReason: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  useBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.gold,
  },
  useBtnText: {
    fontFamily: Typography.sansBold,
    fontSize: FontSize.sm,
    color: Colors.bg,
  },
  suggestionImpact: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  rowAccent: {
    width: 3,
    height: 40,
    borderRadius: 2,
  },
  rowEmoji: {
    fontSize: FontSize.xxl,
    width: 28,
    textAlign: 'center',
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  rowMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowMeta: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  filterArea: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  dropdownOverlay: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 100,
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
});
