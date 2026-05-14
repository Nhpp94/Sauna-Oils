import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useStudio } from '../../context/StudioContext';
import { useRemoteData } from '../../context/RemoteDataContext';
import { usePurchase } from '../../context/PurchaseContext';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import GrainOverlay from '../../components/GrainOverlay';
import { CATEGORY_META } from '../../constants/categories';
import { OilIcon } from '../../components/OilIcon';
import { VIBE_COLORS, VIBE_ICONS, TIME_ICONS } from '../../constants/icons';
import type { StudioSession } from '../../types/studio';

type StudioTab = 'oils' | 'sessions' | 'members';

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function formatDate(iso: string) {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function SessionCard({ session, isAdmin, onDelete }: { session: StudioSession; isAdmin: boolean; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const vibeColor = session.vibe ? VIBE_COLORS[session.vibe] ?? Colors.textMuted : Colors.textMuted;
  const vibeIcon = session.vibe ? VIBE_ICONS[session.vibe] : null;
  const timeIcon = session.time_of_day ? TIME_ICONS[session.time_of_day] : null;

  return (
    <TouchableOpacity style={sc.card} onPress={() => setExpanded(e => !e)} activeOpacity={0.82}>
      <View style={sc.header}>
        <View style={sc.titleRow}>
          {vibeIcon && <Ionicons name={vibeIcon as any} size={14} color={vibeColor} style={{ marginRight: 5 }} />}
          <Text style={sc.title} numberOfLines={1}>{session.name}</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={15} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={sc.chips}>
        {session.vibe && (
          <View style={[sc.chip, { borderColor: vibeColor + '44', backgroundColor: vibeColor + '18' }]}>
            <Text style={[sc.chipText, { color: vibeColor }]}>{cap(session.vibe)}</Text>
          </View>
        )}
        {session.time_of_day && (
          <View style={sc.chip}>
            {timeIcon && <Ionicons name={timeIcon as any} size={10} color={Colors.textMuted} style={{ marginRight: 2 }} />}
            <Text style={sc.chipText}>{cap(session.time_of_day)}</Text>
          </View>
        )}
        <View style={sc.chip}>
          <Ionicons name="layers-outline" size={10} color={Colors.textMuted} style={{ marginRight: 2 }} />
          <Text style={sc.chipText}>{session.rounds.length} rounds</Text>
        </View>
      </View>

      {session.description && (
        <Text style={sc.desc} numberOfLines={expanded ? undefined : 2}>{session.description}</Text>
      )}

      {expanded && session.rounds.map((round, ri) => (
        <View key={ri} style={sc.round}>
          <Text style={sc.roundLabel}>Round {ri + 1}</Text>
          <View style={sc.oilChips}>
            {round.slots.map((slot, si) => {
              if (slot.kind === 'empty') return null;
              const label = slot.kind === 'oil' ? slot.oil.name : slot.kind === 'blend' ? slot.blend.name : '';
              return (
                <View key={si} style={sc.oilChip}>
                  <Text style={sc.oilChipText}>{label}</Text>
                </View>
              );
            })}
            {round.incense && (
              <View style={[sc.oilChip, sc.incenseChip]}>
                <Ionicons name="bonfire-outline" size={9} color={Colors.resinous} style={{ marginRight: 2 }} />
                <Text style={[sc.oilChipText, { color: Colors.resinous }]}>{round.incense.name}</Text>
              </View>
            )}
          </View>
        </View>
      ))}

      <View style={sc.footer}>
        <Text style={sc.date}>{formatDate(session.created_at)}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const sc = StyleSheet.create({
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  titleRow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  title: { fontFamily: Typography.serifBold, fontSize: FontSize.lg, color: Colors.textPrimary, flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard },
  chipText: { fontFamily: Typography.sans, fontSize: FontSize.xxs, color: Colors.textMuted, textTransform: 'capitalize' },
  desc: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: FontSize.sm * 1.5 },
  round: { gap: 6, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  roundLabel: { fontFamily: Typography.sansBold, fontSize: FontSize.xxs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5 },
  oilChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  oilChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.sm, backgroundColor: Colors.goldDim, borderWidth: 1, borderColor: Colors.borderGold },
  incenseChip: { backgroundColor: 'rgba(122,80,48,0.15)', borderColor: 'rgba(122,80,48,0.3)', flexDirection: 'row', alignItems: 'center' },
  oilChipText: { fontFamily: Typography.sans, fontSize: FontSize.xxs, color: Colors.gold },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  date: { fontFamily: Typography.sans, fontSize: FontSize.xs, color: Colors.textMuted },
});

export default function StudioDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const {
    studio, membership, studioOils, studioSessions, members, loading, studios,
    isAdmin, setActiveStudioId, leaveStudio, deleteStudioSession, removeMember,
    addOilToStudio, removeOilFromStudio,
  } = useStudio();
  const { purchaseStudioCreator, purchaseLoading } = usePurchase();
  const { oils: allOils } = useRemoteData();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<StudioTab>('oils');
  const [showAddOil, setShowAddOil] = useState(false);
  const [oilSearch, setOilSearch] = useState('');

  const studioOilIds = useMemo(() => new Set(studioOils.map(o => o.id)), [studioOils]);
  const filteredOils = useMemo(() => {
    const q = oilSearch.toLowerCase();
    return allOils.filter(o =>
      !studioOilIds.has(o.id) &&
      (!q || o.name.toLowerCase().includes(q) || o.category.toLowerCase().includes(q))
    );
  }, [allOils, studioOilIds, oilSearch]);

  useEffect(() => {
    if (id) setActiveStudioId(id);
  }, [id]);

  if (loading || !studio) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <GrainOverlay />
        <ActivityIndicator color={Colors.gold} />
      </View>
    );
  }

  const entry = studios.find(e => e.studio.id === id);
  if (entry?.locked) {
    return (
      <View style={styles.container}>
        <GrainOverlay />
        <TouchableOpacity style={[styles.backBtn, { paddingTop: insets.top + Spacing.sm }]} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.gold} />
          <Text style={styles.backText}>Studios</Text>
        </TouchableOpacity>
        <View style={styles.lockedScreen}>
          <View style={styles.lockedIconWrap}>
            <Ionicons name="lock-closed-outline" size={36} color={Colors.textMuted} />
          </View>
          <Text style={styles.lockedTitle}>{studio.name}</Text>
          {isAdmin ? (
            <>
              <Text style={styles.lockedBody}>
                Your subscription has lapsed. Renew to restore access for your entire team.
              </Text>
              <TouchableOpacity
                style={[styles.renewBtn, purchaseLoading && { opacity: 0.5 }]}
                onPress={purchaseStudioCreator}
                activeOpacity={0.85}
                disabled={purchaseLoading}
              >
                {purchaseLoading
                  ? <ActivityIndicator size="small" color={Colors.bg} />
                  : <Text style={styles.renewBtnText}>Renew subscription</Text>
                }
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.lockedBody}>
              This studio is temporarily unavailable. Contact your studio admin to restore access.
            </Text>
          )}
        </View>
      </View>
    );
  }

  function handleDeleteSession(session: StudioSession) {
    Alert.alert('Delete Session', `Delete "${session.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteStudioSession(session.id) },
    ]);
  }

  function handleRemoveMember(userId: string, name: string) {
    Alert.alert('Remove Member', `Remove ${name} from the studio?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMember(userId) },
    ]);
  }

  function handleLeave() {
    const s = studio!;
    Alert.alert('Leave Studio', `Leave "${s.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: async () => {
        await leaveStudio(s.id);
        router.back();
      }},
    ]);
  }

  const tabs: { key: StudioTab; label: string }[] = [
    { key: 'oils', label: `Oils${studioOils.length ? ` · ${studioOils.length}` : ''}` },
    { key: 'sessions', label: `Sessions${studioSessions.length ? ` · ${studioSessions.length}` : ''}` },
    ...(isAdmin ? [{ key: 'members' as StudioTab, label: `Members${members.length ? ` · ${members.length}` : ''}` }] : []),
  ];

  return (
    <View style={styles.container}>
      <GrainOverlay />
      {/* Nav header */}
      <View style={[styles.navHeader, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.gold} />
          <Text style={styles.backText}>Studios</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.studioHeader}>
          <View style={styles.studioInfo}>
            <Text style={styles.studioName}>{studio.name}</Text>
            {studio.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.locationText}>{studio.location}</Text>
              </View>
            )}
            <View style={styles.roleChip}>
              <Ionicons
                name={isAdmin ? 'shield-checkmark-outline' : 'person-outline'}
                size={10}
                color={isAdmin ? Colors.gold : Colors.textMuted}
              />
              <Text style={[styles.roleText, isAdmin && styles.roleTextAdmin]}>
                {isAdmin ? 'Admin' : 'Member'}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions} />
        </View>

        {studio.description && (
          <Text style={styles.studioDesc}>{studio.description}</Text>
        )}

        {/* Join code (admin only) */}
        {isAdmin && (
          <View style={styles.joinCodeBox}>
            <Ionicons name="key-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.joinCodeLabel}>Join code</Text>
            <Text style={styles.joinCode}>{studio.join_code}</Text>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.segmentRow}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.segmentTab, activeTab === tab.key && styles.segmentTabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentLabel, activeTab === tab.key && styles.segmentLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Oils */}
        {activeTab === 'oils' && (
          <>
            {isAdmin && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => { setShowAddOil(v => !v); setOilSearch(''); }}
                activeOpacity={0.8}
              >
                <Ionicons name={showAddOil ? 'close-outline' : 'add-circle-outline'} size={18} color={Colors.gold} />
                <Text style={styles.addBtnText}>{showAddOil ? 'Done' : 'Add oil'}</Text>
              </TouchableOpacity>
            )}

            {showAddOil && (
              <>
                <View style={styles.searchWrap}>
                  <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search oils..."
                    placeholderTextColor={Colors.textMuted}
                    value={oilSearch}
                    onChangeText={setOilSearch}
                    autoCorrect={false}
                  />
                  {oilSearch.length > 0 && (
                    <TouchableOpacity onPress={() => setOilSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
                {filteredOils.length === 0 ? (
                  <Text style={styles.emptyState}>
                    {oilSearch ? 'No oils match your search' : 'All oils are already in the catalog'}
                  </Text>
                ) : filteredOils.map(oil => {
                  const meta = CATEGORY_META[oil.category];
                  return (
                    <View key={oil.id} style={styles.oilRow}>
                      <View style={[styles.accentBar, { backgroundColor: meta.color }]} />
                      <View style={styles.iconWrap}><OilIcon oil={oil} size={26} /></View>
                      <View style={styles.oilInfo}>
                        <Text style={styles.oilName}>{oil.name}</Text>
                        <View style={styles.oilMeta}>
                          <Ionicons name={meta.icon as any} size={10} color={meta.color} />
                          <Text style={styles.oilMetaText}>{meta.label} · {oil.note} note</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => addOilToStudio(oil)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add-circle-outline" size={22} color={Colors.gold} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </>
            )}

            {!showAddOil && (studioOils.length === 0 ? (
              <Text style={styles.emptyState}>
                {isAdmin ? 'No oils yet — tap Add oil to build your catalog.' : 'No oils in the studio catalog yet.'}
              </Text>
            ) : studioOils.map(oil => {
              const meta = CATEGORY_META[oil.category];
              return (
                <TouchableOpacity
                  key={oil.id}
                  style={styles.oilRow}
                  onPress={() => router.push(`/oil/${oil.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.accentBar, { backgroundColor: meta.color }]} />
                  <View style={styles.iconWrap}><OilIcon oil={oil} size={26} /></View>
                  <View style={styles.oilInfo}>
                    <Text style={styles.oilName}>{oil.name}</Text>
                    <View style={styles.oilMeta}>
                      <Ionicons name={meta.icon as any} size={10} color={meta.color} />
                      <Text style={styles.oilMetaText}>{meta.label} · {oil.note} note</Text>
                    </View>
                  </View>
                  {isAdmin ? (
                    <TouchableOpacity
                      onPress={() => Alert.alert('Remove Oil', `Remove "${oil.name}" from the catalog?`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Remove', style: 'destructive', onPress: () => removeOilFromStudio(oil.id) },
                      ])}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="remove-circle-outline" size={20} color={Colors.textMuted} />
                    </TouchableOpacity>
                  ) : (
                    <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>
              );
            }))}
          </>
        )}

        {/* Sessions */}
        {activeTab === 'sessions' && (
          <>
            {isAdmin && (
              <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/studio/new-session')} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={18} color={Colors.gold} />
                <Text style={styles.addBtnText}>New session</Text>
              </TouchableOpacity>
            )}
            {studioSessions.length === 0 ? (
              <Text style={styles.emptyState}>
                {isAdmin ? 'No sessions yet — create one for your team.' : 'No sessions created yet.'}
              </Text>
            ) : studioSessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                isAdmin={isAdmin}
                onDelete={() => handleDeleteSession(session)}
              />
            ))}
          </>
        )}

        {/* Members (admin only) */}
        {activeTab === 'members' && isAdmin && (
          <>
            {members.map(member => {
              const name = member.profiles?.display_name || member.profiles?.email || 'Unknown';
              const isSelf = member.user_id === membership?.user_id;
              return (
                <View key={member.user_id} style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{name}{isSelf ? ' (you)' : ''}</Text>
                    <Text style={styles.memberEmail}>{member.profiles?.email}</Text>
                  </View>
                  <View style={[styles.memberRoleChip, member.role === 'admin' && styles.memberRoleChipAdmin]}>
                    <Text style={[styles.memberRoleText, member.role === 'admin' && styles.memberRoleTextAdmin]}>
                      {cap(member.role)}
                    </Text>
                  </View>
                  {!isSelf && member.role !== 'admin' && (
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(member.user_id, name)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="person-remove-outline" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleLeave} activeOpacity={0.7} style={styles.footerBtn}>
            <Text style={styles.footerBtnText}>Leave studio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 40 },
  studioHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.sm },
  studioInfo: { flex: 1, gap: 4 },
  studioName: { fontFamily: Typography.serifBold, fontSize: FontSize.display, color: Colors.textPrimary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted },
  roleChip: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, marginTop: 2 },
  roleText: { fontFamily: Typography.sansMedium, fontSize: FontSize.xxs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  roleTextAdmin: { color: Colors.gold },
  headerActions: { gap: Spacing.sm, alignItems: 'flex-end' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, marginBottom: Spacing.md, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  searchInput: { flex: 1, paddingVertical: Spacing.md, fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textPrimary },
  studioDesc: { fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: FontSize.md * 1.5, marginBottom: Spacing.md },
  joinCodeBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  joinCodeLabel: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted, flex: 1 },
  joinCode: { fontFamily: Typography.serifBold, fontSize: FontSize.lg, color: Colors.gold, letterSpacing: 3 },
  segmentRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  segmentTab: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  segmentTabActive: { borderColor: Colors.gold, backgroundColor: Colors.goldDim },
  segmentLabel: { fontFamily: Typography.sansMedium, fontSize: FontSize.sm, color: Colors.textMuted },
  segmentLabelActive: { color: Colors.gold },
  emptyState: { fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl, lineHeight: FontSize.md * 1.5 },
  oilRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, paddingRight: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.sm },
  accentBar: { width: 3, height: 40, borderRadius: 2 },
  iconWrap: { width: 30, alignItems: 'center', justifyContent: 'center' },
  oilInfo: { flex: 1 },
  oilName: { fontFamily: Typography.sansMedium, fontSize: FontSize.md, color: Colors.textPrimary },
  oilMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  oilMetaText: { fontFamily: Typography.sans, fontSize: FontSize.xs, color: Colors.textMuted },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  addBtnText: { fontFamily: Typography.sansMedium, fontSize: FontSize.sm, color: Colors.gold },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.goldDim, borderWidth: 1, borderColor: Colors.borderGold, alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { fontFamily: Typography.serifBold, fontSize: FontSize.md, color: Colors.gold },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { fontFamily: Typography.sansMedium, fontSize: FontSize.md, color: Colors.textPrimary },
  memberEmail: { fontFamily: Typography.sans, fontSize: FontSize.xs, color: Colors.textMuted },
  memberRoleChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard },
  memberRoleChipAdmin: { borderColor: Colors.borderGold, backgroundColor: Colors.goldDim },
  memberRoleText: { fontFamily: Typography.sansBold, fontSize: FontSize.xxs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  memberRoleTextAdmin: { color: Colors.gold },
  footer: { marginTop: Spacing.xl, alignItems: 'center' },
  footerBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
  footerBtnText: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted },
  navHeader: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 60 },
  backText: { fontFamily: Typography.sansMedium, fontSize: FontSize.md, color: Colors.gold },
  lockedScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  lockedIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  lockedTitle: { fontFamily: Typography.serifBold, fontSize: FontSize.xl, color: Colors.textMuted, textAlign: 'center' },
  lockedBody: { fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: FontSize.md * 1.6 },
  renewBtn: { backgroundColor: Colors.goldDim, borderWidth: 1, borderColor: Colors.borderGold, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, alignItems: 'center', marginTop: Spacing.sm },
  renewBtnText: { fontFamily: Typography.sansMedium, fontSize: FontSize.md, color: Colors.gold },
});
