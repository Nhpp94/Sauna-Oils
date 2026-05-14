import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStudio } from '../../context/StudioContext';
import { usePurchase } from '../../context/PurchaseContext';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import GrainOverlay from '../../components/GrainOverlay';
import { AddOilModal } from '../../components/AddOilModal';
import { AddBlendModal } from '../../components/AddBlendModal';
import { AddIncenseModal } from '../../components/AddIncenseModal';
import { CATEGORY_META } from '../../constants/categories';
import { FORM_META } from '../../constants/incenseForms';
import { OilIcon } from '../../components/OilIcon';
import { BotanicalIcon } from '../../components/BotanicalIcon';
import { VIBE_COLORS, VIBE_ICONS, TIME_ICONS } from '../../constants/icons';
import { getSharedSession, setPendingLoad, setSharedSession } from '../../store/sessionStore';
import type { StudioMember, StudioSession } from '../../types/studio';
import type { TimeOfDay, Vibe } from '../../data/oils';
import type { EssentialOil } from '../../data/oils';
import type { Incense } from '../../data/incense';
import type { Blend } from '../../data/blends';

type StudioTab = 'library' | 'kit' | 'sessions';
type LibraryTab = 'oils' | 'blends' | 'incense';
type KitTab = 'oils' | 'incense' | 'blends';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function isStudioCustomOil(oil: EssentialOil) {
  return oil.id.startsWith('studio_custom_');
}

function isStudioCustomBlend(blend: Blend) {
  return blend.id.startsWith('studio_custom_blend_');
}

function isStudioCustomIncense(incense: Incense) {
  return incense.id.startsWith('studio_custom_incense_');
}

function SessionCard({ session, isAdmin, onDelete, onOpen }: { session: StudioSession; isAdmin: boolean; onDelete: () => void; onOpen: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const vibeColor = session.vibe ? VIBE_COLORS[session.vibe] ?? Colors.textMuted : Colors.textMuted;
  const vibeIcon = session.vibe ? VIBE_ICONS[session.vibe] : null;
  const timeIcon = session.time_of_day ? TIME_ICONS[session.time_of_day] : null;

  return (
    <TouchableOpacity style={sc.card} onPress={onOpen} activeOpacity={0.82}>
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
        <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

function MembersPanel({
  members,
  currentUserId,
  onRemove,
  onPromote,
}: {
  members: StudioMember[];
  currentUserId?: string;
  onRemove: (userId: string, name: string) => void;
  onPromote: (userId: string, name: string) => void;
}) {
  return (
    <View style={styles.membersPanel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Members</Text>
        <Text style={styles.panelCount}>{members.length}</Text>
      </View>
      {members.map(member => {
        const name = member.profiles?.display_name || member.profiles?.email || 'Unknown';
        const isSelf = member.user_id === currentUserId;
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
              <View style={styles.memberActions}>
                <TouchableOpacity
                  style={styles.promoteBtn}
                  onPress={() => onPromote(member.user_id, name)}
                  activeOpacity={0.75}
                >
                  <Ionicons name="shield-checkmark-outline" size={12} color={Colors.gold} />
                  <Text style={styles.promoteText}>Make admin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onRemove(member.user_id, name)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-remove-outline" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function OilRow({
  oil,
  inKit,
  isAdmin,
  canDelete,
  action,
  onPress,
}: {
  oil: EssentialOil;
  inKit: boolean;
  isAdmin: boolean;
  canDelete?: boolean;
  action?: () => void;
  onPress?: () => void;
}) {
  const meta = CATEGORY_META[oil.category];
  return (
    <TouchableOpacity
      style={styles.assetRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={[styles.accentBar, { backgroundColor: meta.color }]} />
      <View style={styles.iconWrap}><OilIcon oil={oil} size={26} /></View>
      <View style={styles.assetInfo}>
        <View style={styles.assetNameRow}>
          <Text style={styles.assetName}>{oil.name}</Text>
          {canDelete && <Text style={styles.customBadgeText}>Custom</Text>}
        </View>
        <View style={styles.assetMeta}>
          <Ionicons name={meta.icon as any} size={10} color={meta.color} />
          <Text style={styles.assetMetaText}>{meta.label} · {oil.note} note</Text>
        </View>
      </View>
      {isAdmin && action ? (
        <TouchableOpacity onPress={action} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
          <Ionicons name={inKit ? 'remove-circle-outline' : 'add-circle-outline'} size={22} color={inKit ? Colors.textMuted : Colors.gold} />
        </TouchableOpacity>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
      ) : null}
    </TouchableOpacity>
  );
}

function IncenseRow({
  incense,
  inKit,
  isAdmin,
  action,
  onPress,
}: {
  incense: Incense;
  inKit: boolean;
  isAdmin: boolean;
  action?: () => void;
  onPress?: () => void;
}) {
  const formMeta = FORM_META[incense.form];
  const botanicalKey = INCENSE_BOTANICALS[incense.id] ?? INCENSE_FORM_BOTANICALS[incense.form] ?? 'resin-drop';
  return (
    <TouchableOpacity
      style={styles.assetRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={[styles.accentBar, { backgroundColor: formMeta.color }]} />
      <View style={styles.iconWrap}>
        <BotanicalIcon botanicalKey={botanicalKey} size={26} color={Colors.iconOnAccent} />
      </View>
      <View style={styles.assetInfo}>
        <Text style={styles.assetName}>{incense.name}</Text>
        <Text style={styles.assetMetaText}>{formMeta.label} · {incense.origin}</Text>
      </View>
      {isAdmin && action ? (
        <TouchableOpacity onPress={action} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
          <Ionicons name={inKit ? 'remove-circle-outline' : 'add-circle-outline'} size={22} color={inKit ? Colors.textMuted : Colors.gold} />
        </TouchableOpacity>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
      ) : null}
    </TouchableOpacity>
  );
}

function BlendRow({
  blend,
  inKit,
  isAdmin,
  canDelete,
  action,
  onPress,
}: {
  blend: Blend;
  inKit: boolean;
  isAdmin: boolean;
  canDelete?: boolean;
  action?: () => void;
  onPress?: () => void;
}) {
  const vibeColor = blend.vibes[0] ? VIBE_COLORS[blend.vibes[0]] ?? Colors.gold : Colors.gold;
  return (
    <TouchableOpacity
      style={styles.assetRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={[styles.accentBar, { backgroundColor: vibeColor }]} />
      <View style={styles.iconWrap}>
        <BotanicalIcon botanicalKey={canDelete ? 'star' : 'sprout'} size={26} color={Colors.iconOnAccent} />
      </View>
      <View style={styles.assetInfo}>
        <View style={styles.assetNameRow}>
          <Text style={styles.assetName}>{blend.name}</Text>
          {canDelete && <Text style={styles.customBadgeText}>Custom</Text>}
        </View>
        <Text style={styles.assetMetaText}>
          {blend.oils.length} oils{blend.vibes[0] ? ` · ${cap(blend.vibes[0])}` : ''}
        </Text>
      </View>
      {isAdmin && action ? (
        <TouchableOpacity onPress={action} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
          <Ionicons name={inKit ? 'remove-circle-outline' : 'add-circle-outline'} size={22} color={inKit ? Colors.textMuted : Colors.gold} />
        </TouchableOpacity>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
      ) : null}
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
  const {
    studio, membership, studioLibraryOils, studioLibraryBlends, studioLibraryIncense, studioKitOils, studioKitIncense, studioKitBlends, studioSessions, members,
    loading, studios, isAdmin, setActiveStudioId, leaveStudio, deleteStudioSession, removeMember,
    updateStudioDetails, promoteMemberToAdmin,
    createStudioOil, deleteStudioOil, addOilToStudioKit, removeOilFromStudioKit,
    addIncenseToStudioKit, removeIncenseFromStudioKit,
    createStudioIncense, deleteStudioIncense,
    createStudioBlend, deleteStudioBlend, addBlendToStudioKit, removeBlendFromStudioKit,
  } = useStudio();
  const { purchaseStudioCreator, purchaseLoading } = usePurchase();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<StudioTab>(isAdmin ? 'library' : 'kit');
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('oils');
  const [kitTab, setKitTab] = useState<KitTab>('oils');
  const [search, setSearch] = useState('');
  const [showCreateOil, setShowCreateOil] = useState(false);
  const [showCreateBlend, setShowCreateBlend] = useState(false);
  const [showCreateIncense, setShowCreateIncense] = useState(false);
  const [showEditStudio, setShowEditStudio] = useState(false);
  const [editStudioName, setEditStudioName] = useState('');
  const [editStudioLocation, setEditStudioLocation] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (id) setActiveStudioId(id);
  }, [id, setActiveStudioId]);

  useEffect(() => {
    if (!isAdmin && activeTab === 'library') setActiveTab('kit');
  }, [activeTab, isAdmin]);

  const kitOilIds = useMemo(() => new Set(studioKitOils.map(o => o.id)), [studioKitOils]);
  const kitIncenseIds = useMemo(() => new Set(studioKitIncense.map(i => i.id)), [studioKitIncense]);
  const kitBlendIds = useMemo(() => new Set(studioKitBlends.map(b => b.id)), [studioKitBlends]);
  const query = search.trim().toLowerCase();
  const filteredLibraryOils = useMemo(() => (
    studioLibraryOils.filter(o =>
      !query ||
      o.name.toLowerCase().includes(query) ||
      o.category.toLowerCase().includes(query) ||
      o.benefits.some(b => b.toLowerCase().includes(query))
    )
  ), [studioLibraryOils, query]);
  const filteredIncense = useMemo(() => (
    studioLibraryIncense.filter(i =>
      !query ||
      i.name.toLowerCase().includes(query) ||
      i.origin.toLowerCase().includes(query) ||
      i.form.toLowerCase().includes(query)
    )
  ), [studioLibraryIncense, query]);
  const filteredBlends = useMemo(() => (
    studioLibraryBlends.filter(b =>
      !query ||
      b.name.toLowerCase().includes(query) ||
      b.oils.some(o => o.name.toLowerCase().includes(query)) ||
      b.benefits.some(benefit => benefit.toLowerCase().includes(query))
    )
  ), [studioLibraryBlends, query]);

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

  function handleOpenSession(session: StudioSession) {
    const loadedSession = {
      id: `studio_${session.id}`,
      name: session.name,
      createdAt: new Date(session.created_at).getTime(),
      source: 'built' as const,
      vibe: session.vibe as Vibe | null,
      time: session.time_of_day as TimeOfDay | null,
      rounds: session.rounds,
    };
    const current = getSharedSession();
    if (current) {
      setSharedSession({
        ...current,
        source: loadedSession.source,
        vibe: loadedSession.vibe,
        time: loadedSession.time,
        rounds: loadedSession.rounds,
      });
    }
    setPendingLoad(loadedSession);
    router.push('/session');
  }

  function handleDeleteStudioOil(oil: EssentialOil) {
    Alert.alert('Delete Studio Oil', `Delete "${oil.name}" from this studio library and kit?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteStudioOil(oil.id) },
    ]);
  }

  function handleDeleteStudioBlend(blend: Blend) {
    Alert.alert('Delete Studio Blend', `Delete "${blend.name}" from this studio library and kit?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteStudioBlend(blend.id) },
    ]);
  }

  function handleDeleteStudioIncense(incense: Incense) {
    Alert.alert('Delete Studio Incense', `Delete "${incense.name}" from this studio library and kit?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteStudioIncense(incense.id) },
    ]);
  }

  function handleRemoveMember(userId: string, name: string) {
    Alert.alert('Remove Member', `Remove ${name} from the studio?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMember(userId) },
    ]);
  }

  function openEditStudio() {
    setEditStudioName(studio?.name ?? '');
    setEditStudioLocation(studio?.location ?? '');
    setShowEditStudio(true);
  }

  async function handleSaveStudioDetails() {
    if (!editStudioName.trim()) {
      Alert.alert('Name required', 'Please enter a studio name.');
      return;
    }
    setEditSaving(true);
    const err = await updateStudioDetails(editStudioName, editStudioLocation);
    setEditSaving(false);
    if (err) {
      Alert.alert('Error', err);
    } else {
      setShowEditStudio(false);
    }
  }

  function handlePromoteMember(userId: string, name: string) {
    Alert.alert('Make Admin', `Make ${name} an admin of this studio?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Make admin',
        onPress: async () => {
          const err = await promoteMemberToAdmin(userId);
          if (err) Alert.alert('Error', err);
        },
      },
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

  const tabs: { key: StudioTab; label: string }[] = isAdmin
    ? [
        { key: 'library', label: `Library · ${studioLibraryOils.length + studioLibraryBlends.length + studioLibraryIncense.length}` },
        { key: 'kit', label: `Kit · ${studioKitOils.length + studioKitIncense.length + studioKitBlends.length}` },
        { key: 'sessions', label: `Sessions${studioSessions.length ? ` · ${studioSessions.length}` : ''}` },
      ]
    : [
        { key: 'kit', label: `Kit · ${studioKitOils.length + studioKitIncense.length + studioKitBlends.length}` },
        { key: 'sessions', label: `Sessions${studioSessions.length ? ` · ${studioSessions.length}` : ''}` },
      ];

  const renderSessions = () => (
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
          onOpen={() => handleOpenSession(session)}
        />
      ))}
    </>
  );

  return (
    <View style={styles.container}>
      <GrainOverlay />

      <View style={[styles.navHeader, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.gold} />
          <Text style={styles.backText}>Studios</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
          {isAdmin && (
            <TouchableOpacity style={styles.editStudioBtn} onPress={openEditStudio} activeOpacity={0.75}>
              <Ionicons name="create-outline" size={18} color={Colors.gold} />
            </TouchableOpacity>
          )}
        </View>

        {studio.description && <Text style={styles.studioDesc}>{studio.description}</Text>}

        {isAdmin && (
          <>
            <MembersPanel
              members={members}
              currentUserId={membership?.user_id}
              onRemove={handleRemoveMember}
              onPromote={handlePromoteMember}
            />
            <View style={styles.joinCodeBox}>
              <Ionicons name="key-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.joinCodeLabel}>Join code</Text>
              <Text style={styles.joinCode}>{studio.join_code}</Text>
            </View>
          </>
        )}

        <View style={styles.segmentRow}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.segmentTab, activeTab === tab.key && styles.segmentTabActive]}
              onPress={() => { setActiveTab(tab.key); setSearch(''); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentLabel, activeTab === tab.key && styles.segmentLabelActive]} numberOfLines={1}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'library' && isAdmin && (
          <>
            <View style={styles.innerTabs}>
              {(['oils', 'blends', 'incense'] as LibraryTab[]).map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.innerTab, libraryTab === tab && styles.innerTabActive]}
                  onPress={() => { setLibraryTab(tab); setSearch(''); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.innerTabText, libraryTab === tab && styles.innerTabTextActive]}>
                    {cap(tab)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {libraryTab === 'oils' && (
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreateOil(true)} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={18} color={Colors.gold} />
                <Text style={styles.addBtnText}>Create oil</Text>
              </TouchableOpacity>
            )}

            {libraryTab === 'blends' && (
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreateBlend(true)} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={18} color={Colors.gold} />
                <Text style={styles.addBtnText}>Create blend</Text>
              </TouchableOpacity>
            )}

            {libraryTab === 'incense' && (
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreateIncense(true)} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={18} color={Colors.gold} />
                <Text style={styles.addBtnText}>Create incense</Text>
              </TouchableOpacity>
            )}

            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder={libraryTab === 'oils' ? 'Search oils...' : libraryTab === 'blends' ? 'Search blends...' : 'Search incense...'}
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

            {libraryTab === 'oils' && (
              <>
                <Text style={styles.resultCount}>{filteredLibraryOils.length} oils · {studioKitOils.length} in kit</Text>
                {filteredLibraryOils.map(oil => {
                  const inKit = kitOilIds.has(oil.id);
                  return (
                    <View key={oil.id}>
                      <OilRow
                        oil={oil}
                        inKit={inKit}
                        isAdmin
                        canDelete={isStudioCustomOil(oil)}
                        action={() => inKit ? removeOilFromStudioKit(oil.id) : addOilToStudioKit(oil.id)}
                        onPress={isStudioCustomOil(oil) ? undefined : () => router.push(`/oil/${oil.id}`)}
                      />
                      {isStudioCustomOil(oil) && (
                        <TouchableOpacity style={styles.deleteCustomBtn} onPress={() => handleDeleteStudioOil(oil)} activeOpacity={0.7}>
                          <Ionicons name="trash-outline" size={13} color={Colors.textMuted} />
                          <Text style={styles.deleteCustomText}>Delete custom oil</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </>
            )}

            {libraryTab === 'blends' && (
              <>
                <Text style={styles.resultCount}>{filteredBlends.length} blends · {studioKitBlends.length} in kit</Text>
                {filteredBlends.map(blend => {
                  const inKit = kitBlendIds.has(blend.id);
                  const customBlend = isStudioCustomBlend(blend);
                  return (
                    <View key={blend.id}>
                      <BlendRow
                        blend={blend}
                        inKit={inKit}
                        isAdmin
                        canDelete={customBlend}
                        action={() => inKit ? removeBlendFromStudioKit(blend.id) : addBlendToStudioKit(blend.id)}
                        onPress={customBlend ? undefined : () => router.push(`/blend/${blend.id}`)}
                      />
                      {customBlend && (
                        <TouchableOpacity style={styles.deleteCustomBtn} onPress={() => handleDeleteStudioBlend(blend)} activeOpacity={0.7}>
                          <Ionicons name="trash-outline" size={13} color={Colors.textMuted} />
                          <Text style={styles.deleteCustomText}>Delete custom blend</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </>
            )}

            {libraryTab === 'incense' && (
              <>
                <Text style={styles.resultCount}>{filteredIncense.length} incense · {studioKitIncense.length} in kit</Text>
                {filteredIncense.map(incense => {
                  const inKit = kitIncenseIds.has(incense.id);
                  const customIncense = isStudioCustomIncense(incense);
                  return (
                    <View key={incense.id}>
                      <IncenseRow
                        incense={incense}
                        inKit={inKit}
                        isAdmin
                        action={() => inKit ? removeIncenseFromStudioKit(incense.id) : addIncenseToStudioKit(incense.id)}
                        onPress={customIncense ? undefined : () => router.push(`/incense/${incense.id}`)}
                      />
                      {customIncense && (
                        <TouchableOpacity style={styles.deleteCustomBtn} onPress={() => handleDeleteStudioIncense(incense)} activeOpacity={0.7}>
                          <Ionicons name="trash-outline" size={13} color={Colors.textMuted} />
                          <Text style={styles.deleteCustomText}>Delete custom incense</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </>
        )}

        {activeTab === 'kit' && (
          <>
            <View style={styles.innerTabs}>
              {(['oils', 'incense', 'blends'] as KitTab[]).map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.innerTab, kitTab === tab && styles.innerTabActive]}
                  onPress={() => { setKitTab(tab); setSearch(''); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.innerTabText, kitTab === tab && styles.innerTabTextActive]}>
                    {cap(tab)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {kitTab === 'oils' && (
              <>
                {studioKitOils.length === 0 ? (
                  <Text style={styles.emptyState}>
                    {isAdmin ? 'No oils in the Studio Kit yet — add them from Library.' : 'No oils in the Studio Kit yet.'}
                  </Text>
                ) : studioKitOils.map(oil => (
                  <OilRow
                    key={oil.id}
                    oil={oil}
                    inKit
                    isAdmin={isAdmin}
                    action={isAdmin ? () => removeOilFromStudioKit(oil.id) : undefined}
                    onPress={isStudioCustomOil(oil) ? undefined : () => router.push(`/oil/${oil.id}`)}
                  />
                ))}
              </>
            )}

            {kitTab === 'incense' && (
              <>
                {studioKitIncense.length === 0 ? (
                  <Text style={styles.emptyState}>
                    {isAdmin ? 'No incense in the Studio Kit yet — add it from Library.' : 'No incense in the Studio Kit yet.'}
                  </Text>
                ) : studioKitIncense.map(incense => (
                    <IncenseRow
                      key={incense.id}
                      incense={incense}
                      inKit
                      isAdmin={isAdmin}
                      action={isAdmin ? () => removeIncenseFromStudioKit(incense.id) : undefined}
                      onPress={isStudioCustomIncense(incense) ? undefined : () => router.push(`/incense/${incense.id}`)}
                    />
                ))}
              </>
            )}

            {kitTab === 'blends' && (
              <>
                {studioKitBlends.length === 0 ? (
                  <Text style={styles.emptyState}>
                    {isAdmin ? 'No blends in the Studio Kit yet — add them from Library.' : 'No blends in the Studio Kit yet.'}
                  </Text>
                ) : studioKitBlends.map(blend => {
                  const customBlend = isStudioCustomBlend(blend);
                  return (
                    <View key={blend.id}>
                      <BlendRow
                        blend={blend}
                        inKit
                        isAdmin={isAdmin}
                        canDelete={customBlend}
                        action={isAdmin ? () => removeBlendFromStudioKit(blend.id) : undefined}
                        onPress={customBlend ? undefined : () => router.push(`/blend/${blend.id}`)}
                      />
                      {isAdmin && customBlend && (
                        <TouchableOpacity style={styles.deleteCustomBtn} onPress={() => handleDeleteStudioBlend(blend)} activeOpacity={0.7}>
                          <Ionicons name="trash-outline" size={13} color={Colors.textMuted} />
                          <Text style={styles.deleteCustomText}>Delete custom blend</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </>
        )}

        {activeTab === 'sessions' && renderSessions()}

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleLeave} activeOpacity={0.7} style={styles.footerBtn}>
            <Text style={styles.footerBtnText}>Leave studio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AddOilModal
        visible={showCreateOil}
        title="Create Studio Oil"
        saveLabel="Create Oil"
        showAddToKitToggle
        onClose={() => setShowCreateOil(false)}
        onSave={async (oil, addToKit) => {
          const err = await createStudioOil(oil, addToKit ?? true);
          if (err) Alert.alert('Error', err);
        }}
      />
      <AddBlendModal
        visible={showCreateBlend}
        title="Create Studio Blend"
        saveLabel="Create Blend"
        showAddToKitToggle
        oilOptions={studioLibraryOils}
        onClose={() => setShowCreateBlend(false)}
        onSave={async (blend, addToKit) => {
          const err = await createStudioBlend(blend, addToKit ?? true);
          if (err) Alert.alert('Error', err);
        }}
      />
      <AddIncenseModal
        visible={showCreateIncense}
        title="Create Studio Incense"
        saveLabel="Create Incense"
        showAddToKitToggle
        onClose={() => setShowCreateIncense(false)}
        onSave={async (incense, addToKit) => {
          const err = await createStudioIncense(incense, addToKit ?? true);
          if (err) Alert.alert('Error', err);
        }}
      />
      <Modal
        visible={showEditStudio}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditStudio(false)}
      >
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Studio</Text>
            <TouchableOpacity onPress={() => setShowEditStudio(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalLabel}>Studio name</Text>
            <TextInput
              style={styles.modalInput}
              value={editStudioName}
              onChangeText={setEditStudioName}
              placeholder="Studio name"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
            />
            <Text style={styles.modalLabel}>Location</Text>
            <TextInput
              style={styles.modalInput}
              value={editStudioLocation}
              onChangeText={setEditStudioLocation}
              placeholder="Location (optional)"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
            />
            <TouchableOpacity
              style={[styles.modalSaveBtn, (!editStudioName.trim() || editSaving) && styles.modalSaveBtnDisabled]}
              onPress={handleSaveStudioDetails}
              disabled={!editStudioName.trim() || editSaving}
              activeOpacity={0.85}
            >
              {editSaving
                ? <ActivityIndicator size="small" color={Colors.bg} />
                : <Text style={styles.modalSaveText}>Save changes</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 40 },
  navHeader: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 60 },
  backText: { fontFamily: Typography.sansMedium, fontSize: FontSize.md, color: Colors.gold },
  studioHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.sm },
  studioInfo: { flex: 1, gap: 4 },
  studioName: { fontFamily: Typography.serifBold, fontSize: FontSize.display, color: Colors.textPrimary },
  editStudioBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: Colors.borderGold, backgroundColor: Colors.goldDim, alignItems: 'center', justifyContent: 'center', marginLeft: Spacing.sm },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted },
  roleChip: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, marginTop: 2 },
  roleText: { fontFamily: Typography.sansMedium, fontSize: FontSize.xxs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  roleTextAdmin: { color: Colors.gold },
  studioDesc: { fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: FontSize.md * 1.5, marginBottom: Spacing.md },
  membersPanel: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelTitle: { fontFamily: Typography.serifBold, fontSize: FontSize.lg, color: Colors.textPrimary },
  panelCount: { fontFamily: Typography.sansBold, fontSize: FontSize.xs, color: Colors.gold, borderWidth: 1, borderColor: Colors.borderGold, backgroundColor: Colors.goldDim, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  memberAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.goldDim, borderWidth: 1, borderColor: Colors.borderGold, alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { fontFamily: Typography.serifBold, fontSize: FontSize.sm, color: Colors.gold },
  memberInfo: { flex: 1, gap: 1 },
  memberName: { fontFamily: Typography.sansMedium, fontSize: FontSize.sm, color: Colors.textPrimary },
  memberEmail: { fontFamily: Typography.sans, fontSize: FontSize.xs, color: Colors.textMuted },
  memberRoleChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard },
  memberRoleChipAdmin: { borderColor: Colors.borderGold, backgroundColor: Colors.goldDim },
  memberRoleText: { fontFamily: Typography.sansBold, fontSize: FontSize.xxs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  memberRoleTextAdmin: { color: Colors.gold },
  memberActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  promoteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.borderGold, backgroundColor: Colors.goldDim, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  promoteText: { fontFamily: Typography.sansMedium, fontSize: FontSize.xxs, color: Colors.gold },
  joinCodeBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  joinCodeLabel: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted, flex: 1 },
  joinCode: { fontFamily: Typography.serifBold, fontSize: FontSize.lg, color: Colors.gold, letterSpacing: 3 },
  segmentRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  segmentTab: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  segmentTabActive: { borderColor: Colors.gold, backgroundColor: Colors.goldDim },
  segmentLabel: { fontFamily: Typography.sansMedium, fontSize: FontSize.sm, color: Colors.textMuted },
  segmentLabelActive: { color: Colors.gold },
  innerTabs: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  innerTab: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', backgroundColor: Colors.bgCard },
  innerTabActive: { borderColor: Colors.borderGold, backgroundColor: Colors.goldDim },
  innerTabText: { fontFamily: Typography.sansMedium, fontSize: FontSize.xs, color: Colors.textMuted },
  innerTabTextActive: { color: Colors.gold },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  addBtnText: { fontFamily: Typography.sansMedium, fontSize: FontSize.sm, color: Colors.gold },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, marginBottom: Spacing.md, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  searchInput: { flex: 1, paddingVertical: Spacing.md, fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textPrimary },
  resultCount: { fontFamily: Typography.sans, fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.sm },
  emptyState: { fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl, lineHeight: FontSize.md * 1.5 },
  assetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, paddingRight: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.sm },
  accentBar: { width: 3, height: 40, borderRadius: 2 },
  iconWrap: { width: 30, alignItems: 'center', justifyContent: 'center' },
  assetInfo: { flex: 1 },
  assetNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  assetName: { fontFamily: Typography.sansMedium, fontSize: FontSize.md, color: Colors.textPrimary },
  assetMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  assetMetaText: { fontFamily: Typography.sans, fontSize: FontSize.xs, color: Colors.textMuted },
  customBadgeText: { fontFamily: Typography.sansBold, fontSize: FontSize.xxs, color: Colors.gold, textTransform: 'uppercase', letterSpacing: 0.5 },
  deleteCustomBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: Spacing.xs, paddingTop: Spacing.xs, paddingBottom: Spacing.sm },
  deleteCustomText: { fontFamily: Typography.sans, fontSize: FontSize.xs, color: Colors.textMuted },
  footer: { marginTop: Spacing.xl, alignItems: 'center' },
  footerBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
  footerBtnText: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted },
  lockedScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  lockedIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  lockedTitle: { fontFamily: Typography.serifBold, fontSize: FontSize.xl, color: Colors.textMuted, textAlign: 'center' },
  lockedBody: { fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: FontSize.md * 1.6 },
  renewBtn: { backgroundColor: Colors.goldDim, borderWidth: 1, borderColor: Colors.borderGold, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, alignItems: 'center', marginTop: Spacing.sm },
  renewBtnText: { fontFamily: Typography.sansMedium, fontSize: FontSize.md, color: Colors.gold },
  modalContainer: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontFamily: Typography.serifBold, fontSize: FontSize.xl, color: Colors.textPrimary },
  modalBody: { padding: Spacing.lg, gap: Spacing.md },
  modalLabel: { fontFamily: Typography.sansBold, fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  modalInput: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textPrimary },
  modalSaveBtn: { backgroundColor: Colors.gold, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.sm },
  modalSaveBtnDisabled: { opacity: 0.45 },
  modalSaveText: { fontFamily: Typography.sansBold, fontSize: FontSize.md, color: Colors.bg },
});
