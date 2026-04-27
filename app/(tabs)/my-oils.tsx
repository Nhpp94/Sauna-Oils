import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { OILS } from '../../data/oils';
import { INCENSE } from '../../data/incense';
import { useMyOils } from '../../hooks/useMyOils';
import { useMyIncense } from '../../hooks/useMyIncense';
import { useSavedSessions, SavedSession } from '../../context/SavedSessionsContext';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import GrainOverlay from '../../components/GrainOverlay';
import { CATEGORY_META } from '../../constants/categories';
import { FORM_META, IncenseForm } from '../../constants/incenseForms';
import { OilIcon } from '../../components/OilIcon';
import { BotanicalIcon } from '../../components/BotanicalIcon';
import { VIBE_COLORS, VIBE_ICONS } from '../../constants/icons';
import { setPendingLoad, setSharedSession, getSharedSession } from '../../store/sessionStore';

const INCENSE_BOTANICALS: Record<string, string> = {
  'palo-santo': 'wood-stick', 'white-sage': 'herb-bundle',
  'frankincense-resin': 'resin-drop', 'myrrh-resin': 'resin-drop',
  'copal-resin': 'resin-drop', 'cedar-chips': 'pine-branch',
  'mugwort': 'herb-bundle', 'dragons-blood': 'resin-drop',
  'benzoin-resin': 'resin-drop', 'sandalwood-chips': 'sandalwood-ring',
  'chamomile-flowers': 'chamomile',
};
const INCENSE_FORM_BOTANICALS: Record<string, string> = {
  wood: 'wood-stick', resin: 'resin-drop', herb: 'herb-bundle',
  stick: 'lavender-sprig', cone: 'lavender-sprig',
};
const FORM_LABEL: Record<string, string> = {
  wood: 'Wood', resin: 'Resin', herb: 'Herb', stick: 'Stick', cone: 'Cone',
};

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function formatDate(ts: number) {
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function MyOilsScreen() {
  const router = useRouter();
  const { isOwned, toggleOwned } = useMyOils();
  const { isOwnedIncense, toggleOwnedIncense } = useMyIncense();
  const { savedSessions, deleteSession } = useSavedSessions();

  const ownedOils = OILS.filter(o => isOwned(o.id)).sort((a, b) => a.name.localeCompare(b.name));
  const ownedIncense = INCENSE.filter(i => isOwnedIncense(i.id)).sort((a, b) => a.name.localeCompare(b.name));
  const [activeTab, setActiveTab] = useState<'oils' | 'incense' | 'sessions'>('oils');

  const handleLoadSession = (session: SavedSession) => {
    const current = getSharedSession();
    if (current) {
      setSharedSession({
        ...current,
        source: session.source,
        vibe: session.vibe,
        time: session.time,
        rounds: session.rounds,
      });
    }
    setPendingLoad(session);
    router.push('/session');
  };

  const handleDeleteSession = (session: SavedSession) => {
    Alert.alert(
      'Delete Session',
      `Delete "${session.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteSession(session.id) },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <GrainOverlay />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header stats */}
        <View style={styles.statsBox}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{ownedOils.length}</Text>
            <Text style={styles.statLabel}>Oils owned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{ownedIncense.length}</Text>
            <Text style={styles.statLabel}>Incense owned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{savedSessions.length}</Text>
            <Text style={styles.statLabel}>Sessions saved</Text>
          </View>
        </View>

        {/* Segment tabs */}
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[styles.segmentTab, activeTab === 'oils' && styles.segmentTabActive]}
            onPress={() => setActiveTab('oils')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentLabel, activeTab === 'oils' && styles.segmentLabelActive]}>
              Oils {ownedOils.length > 0 ? `· ${ownedOils.length}` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentTab, activeTab === 'incense' && styles.segmentTabActive]}
            onPress={() => setActiveTab('incense')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentLabel, activeTab === 'incense' && styles.segmentLabelActive]}>
              Incense {ownedIncense.length > 0 ? `· ${ownedIncense.length}` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentTab, activeTab === 'sessions' && styles.segmentTabActive]}
            onPress={() => setActiveTab('sessions')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentLabel, activeTab === 'sessions' && styles.segmentLabelActive]}>
              Sessions {savedSessions.length > 0 ? `· ${savedSessions.length}` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Oils list */}
        {activeTab === 'oils' && (
          <>
            {ownedOils.length === 0
              ? <Text style={styles.emptyState}>No oils in your kit yet</Text>
              : ownedOils.map(item => {
                  const meta = CATEGORY_META[item.category];
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.row}
                      onPress={() => router.push(`/oil/${item.id}`)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.accentBar, { backgroundColor: meta.color }]} />
                      <View style={styles.iconWrap}>
                        <OilIcon oil={item} size={26} />
                      </View>
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowName}>{item.name}</Text>
                        <View style={styles.rowMetaRow}>
                          <Ionicons name={meta.icon as any} size={10} color={meta.color} />
                          <Text style={styles.rowMeta}>{meta.label} · {item.note} note</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => toggleOwned(item.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={[styles.ownedToggle, styles.ownedToggleActive]}
                      >
                        <Ionicons name="checkmark" size={16} color={Colors.gold} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })
            }
            <TouchableOpacity
              style={styles.addToKitBtn}
              onPress={() => router.push('/(tabs)/library')}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={18} color={Colors.gold} />
              <Text style={styles.addToKitText}>Add oils to your kit</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Incense list */}
        {activeTab === 'incense' && (
          <>
            {ownedIncense.length === 0
              ? <Text style={styles.emptyState}>No incense in your kit yet</Text>
              : ownedIncense.map(item => {
                  const botanicalKey = INCENSE_BOTANICALS[item.id] ?? INCENSE_FORM_BOTANICALS[item.form] ?? 'resin-drop';
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.row}
                      onPress={() => router.push(`/incense/${item.id}`)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.accentBar, { backgroundColor: FORM_META[item.form as IncenseForm].color }]} />
                      <View style={styles.iconWrap}>
                        <BotanicalIcon botanicalKey={botanicalKey} size={26} color="rgba(255,255,255,0.85)" />
                      </View>
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowName}>{item.name}</Text>
                        <View style={styles.rowMetaRow}>
                          <Text style={styles.rowMeta}>{FORM_LABEL[item.form]} · {item.origin}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => toggleOwnedIncense(item.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={[styles.ownedToggle, styles.ownedToggleActive]}
                      >
                        <Ionicons name="checkmark" size={16} color={Colors.gold} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })
            }
            <TouchableOpacity
              style={styles.addToKitBtn}
              onPress={() => router.push('/(tabs)/library?tab=incense')}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={18} color={Colors.gold} />
              <Text style={styles.addToKitText}>Add incense to your kit</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Sessions list */}
        {activeTab === 'sessions' && (
          <>
            {savedSessions.length === 0 ? (
              <>
                <Text style={styles.emptyState}>No saved sessions yet</Text>
                <TouchableOpacity
                  style={styles.addToKitBtn}
                  onPress={() => router.push('/session')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={18} color={Colors.gold} />
                  <Text style={styles.addToKitText}>Create a session</Text>
                </TouchableOpacity>
              </>
            ) : (
              savedSessions.map(session => {
                const vibeColor = session.vibe ? VIBE_COLORS[session.vibe] : Colors.textMuted;
                const totalSlots = session.rounds.reduce((n, r) => n + r.slots.length, 0);
                return (
                  <TouchableOpacity
                    key={session.id}
                    style={styles.sessionCard}
                    onPress={() => handleLoadSession(session)}
                    activeOpacity={0.82}
                  >
                    <View style={styles.sessionCardHeader}>
                      <View style={styles.sessionTitleRow}>
                        {session.vibe && (
                          <Ionicons
                            name={VIBE_ICONS[session.vibe] as any}
                            size={14}
                            color={vibeColor}
                            style={{ marginRight: 5 }}
                          />
                        )}
                        <Text style={styles.sessionCardTitle} numberOfLines={1}>{session.name}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteSession(session)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.sessionMeta}>
                      <View style={[
                        styles.sessionBadge,
                        session.source === 'built' && styles.sessionBadgeBuilt,
                      ]}>
                        <Ionicons
                          name={session.source === 'built' ? 'construct-outline' : 'flash-outline'}
                          size={10}
                          color={session.source === 'built' ? '#30a8c0' : '#e8a020'}
                        />
                        <Text style={[
                          styles.sessionBadgeText,
                          session.source === 'built' ? styles.sessionBadgeTextBuilt : styles.sessionBadgeTextGen,
                        ]}>
                          {session.source === 'built' ? 'Built' : 'Generated'}
                        </Text>
                      </View>

                      {session.vibe && (
                        <View style={[styles.sessionChip, { borderColor: vibeColor + '44', backgroundColor: vibeColor + '18' }]}>
                          <Text style={[styles.sessionChipText, { color: vibeColor }]}>{cap(session.vibe)}</Text>
                        </View>
                      )}
                      {session.time && (
                        <View style={styles.sessionChip}>
                          <Text style={styles.sessionChipText}>{cap(session.time)}</Text>
                        </View>
                      )}
                      <View style={styles.sessionChip}>
                        <Ionicons name="water-outline" size={10} color={Colors.textMuted} style={{ marginRight: 2 }} />
                        <Text style={styles.sessionChipText}>{totalSlots} oils</Text>
                      </View>
                    </View>

                    <Text style={styles.sessionDate}>{formatDate(session.createdAt)}</Text>

                    <View style={styles.sessionFooter}>
                      <Text style={styles.sessionLoadText}>Open session</Text>
                      <Ionicons name="chevron-forward" size={14} color={Colors.gold} />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
  },
  statsBox: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: Colors.border,
  },
  statValue: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.display,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  accentBar: {
    width: 3,
    height: 40,
    borderRadius: 2,
  },
  iconWrap: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 2,
  },
  rowMeta: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  ownedToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownedToggleActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldDim,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  segmentTabActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldDim,
  },
  segmentLabel: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  segmentLabelActive: {
    color: Colors.gold,
  },
  emptyState: {
    fontFamily: Typography.sans,
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  addToKitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addToKitText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.gold,
  },
  sessionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  sessionTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionCardTitle: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    flex: 1,
  },
  sessionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#e8a02044',
    backgroundColor: '#e8a02018',
  },
  sessionBadgeBuilt: {
    borderColor: '#30a8c044',
    backgroundColor: '#30a8c018',
  },
  sessionBadgeText: {
    fontFamily: Typography.sansBold,
    fontSize: FontSize.xxs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#e8a020',
  },
  sessionBadgeTextGen: { color: '#e8a020' },
  sessionBadgeTextBuilt: { color: '#30a8c0' },
  sessionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  sessionChipText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textTransform: 'capitalize',
  },
  sessionDate: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  sessionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sessionLoadText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.gold,
  },
});
