import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Pressable, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import GrainOverlay from '../components/GrainOverlay';
import { useSavedSessions, SavedSession } from '../context/SavedSessionsContext';
import { Colors, Typography, FontSize, Spacing, Radius } from '../constants/theme';
import { VIBE_COLORS, VIBE_ICONS } from '../constants/icons';
import { setPendingLoad, setSharedSession, getSharedSession } from '../store/sessionStore';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function formatDate(ts: number) {
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function SessionCard({ session, onLoad, onDelete }: {
  session: SavedSession;
  onLoad: () => void;
  onDelete: () => void;
}) {
  const vibeColor = session.vibe ? VIBE_COLORS[session.vibe] : Colors.textMuted;
  const totalSlots = session.rounds.reduce((n, r) => n + r.slots.length, 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onLoad} activeOpacity={0.82}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          {session.vibe && (
            <Ionicons
              name={VIBE_ICONS[session.vibe] as any}
              size={14}
              color={vibeColor}
              style={{ marginRight: 5 }}
            />
          )}
          <Text style={styles.cardTitle} numberOfLines={1}>{session.name}</Text>
        </View>
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardMeta}>
        <View style={[styles.sourceBadge, session.source === 'built' && styles.sourceBadgeBuilt]}>
          <Ionicons
            name={session.source === 'built' ? 'construct-outline' : 'flash-outline'}
            size={10}
            color={session.source === 'built' ? '#30a8c0' : '#e8a020'}
          />
          <Text style={[
            styles.sourceBadgeText,
            session.source === 'built' ? styles.sourceBadgeTextBuilt : styles.sourceBadgeTextGen,
          ]}>
            {session.source === 'built' ? 'Built' : 'Generated'}
          </Text>
        </View>

        {session.vibe && (
          <View style={[styles.chip, { borderColor: vibeColor + '44', backgroundColor: vibeColor + '18' }]}>
            <Text style={[styles.chipText, { color: vibeColor }]}>{cap(session.vibe)}</Text>
          </View>
        )}
        {session.time && (
          <View style={styles.chip}>
            <Text style={styles.chipText}>{cap(session.time)}</Text>
          </View>
        )}

        <View style={styles.chip}>
          <Ionicons name="water-outline" size={10} color={Colors.textMuted} style={{ marginRight: 2 }} />
          <Text style={styles.chipText}>{totalSlots} oils</Text>
        </View>
      </View>

      <Text style={styles.cardDate}>{formatDate(session.createdAt)}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.cardLoadText}>Load session</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.gold} />
      </View>
    </TouchableOpacity>
  );
}

export default function SavedSessionsScreen() {
  const router = useRouter();
  const { savedSessions, deleteSession } = useSavedSessions();

  const handleLoad = (session: SavedSession) => {
    // Seed the store directly for immediate result.tsx access
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
    // Also set pending load so session/index.tsx can hydrate the live useSession state
    setPendingLoad(session);
    router.push('/session');
  };

  const handleDelete = (session: SavedSession) => {
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
      <View style={[styles.header, { paddingTop: 56 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#f0e4c8" />
        </Pressable>
        <Text style={styles.title}>Saved Sessions</Text>
        <View style={styles.headerSpacer} />
      </View>

      {savedSessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No saved sessions yet</Text>
          <Text style={styles.emptyDesc}>
            Generate or build a session, then tap the bookmark icon to save it here.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.push('/session')}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyBtnText}>Create a Session</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.countLabel}>
            {savedSessions.length} {savedSessions.length === 1 ? 'session' : 'sessions'}
          </Text>
          {savedSessions.map(s => (
            <SessionCard
              key={s.id}
              session={s}
              onLoad={() => handleLoad(s)}
              onDelete={() => handleDelete(s)}
            />
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: Spacing.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xl,
    color: '#f0e4c8',
  },
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg },
  countLabel: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    flex: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  sourceBadge: {
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
  sourceBadgeBuilt: {
    borderColor: '#30a8c044',
    backgroundColor: '#30a8c018',
  },
  sourceBadgeText: {
    fontFamily: Typography.sansBold,
    fontSize: FontSize.xxs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#e8a020',
  },
  sourceBadgeTextGen: { color: '#e8a020' },
  sourceBadgeTextBuilt: { color: '#30a8c0' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  chipText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textTransform: 'capitalize',
  },
  cardDate: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cardLoadText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.gold,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xxl,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: Typography.sans,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
  },
  emptyBtnText: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.lg,
    color: Colors.bg,
  },
});
