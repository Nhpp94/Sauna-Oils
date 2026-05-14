import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useStudio, StudioEntry } from '../../context/StudioContext';
import { usePurchase } from '../../context/PurchaseContext';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import GrainOverlay from '../../components/GrainOverlay';

// ─── Auth gate ────────────────────────────────────────────────────────────────
function AuthGate() {
  const router = useRouter();
  return (
    <View style={gate.container}>
      <GrainOverlay />
      <View style={gate.inner}>
        <View style={gate.iconWrap}>
          <Ionicons name="business-outline" size={40} color={Colors.gold} />
        </View>
        <Text style={gate.title}>Studio</Text>
        <Text style={gate.body}>
          Sign in to access your sauna studio — shared oils, pre-built sessions, and your team.
        </Text>
        <TouchableOpacity style={gate.primaryBtn} onPress={() => router.push('/auth')} activeOpacity={0.85}>
          <Text style={gate.primaryBtnText}>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={gate.secondaryBtn} onPress={() => router.push('/auth')} activeOpacity={0.7}>
          <Text style={gate.secondaryBtnText}>Create account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const gate = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  iconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.goldDim, borderWidth: 1, borderColor: Colors.borderGold, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  title: { fontFamily: Typography.serifBold, fontSize: FontSize.display, color: Colors.textPrimary, textAlign: 'center' },
  body: { fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: FontSize.md * 1.6 },
  primaryBtn: { backgroundColor: Colors.gold, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, alignItems: 'center', width: '100%', marginTop: Spacing.sm },
  primaryBtnText: { fontFamily: Typography.sansBold, fontSize: FontSize.md, color: Colors.bg },
  secondaryBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, alignItems: 'center', width: '100%' },
  secondaryBtnText: { fontFamily: Typography.sansMedium, fontSize: FontSize.md, color: Colors.textSecondary },
});

// ─── No-studio screen ─────────────────────────────────────────────────────────
function NoStudio() {
  const router = useRouter();
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  return (
    <View style={noStudio.container}>
      <GrainOverlay />
      <ScrollView
        contentContainerStyle={[noStudio.scroll, { paddingTop: insets.top + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={noStudio.title}>Your Studio</Text>
        <Text style={noStudio.subtitle}>
          Join your sauna house studio to access a shared oil catalog and pre-built sessions for your team.
        </Text>

        <TouchableOpacity style={noStudio.card} onPress={() => router.push('/studio/join')} activeOpacity={0.82}>
          <View style={noStudio.cardIcon}>
            <Ionicons name="enter-outline" size={24} color={Colors.gold} />
          </View>
          <View style={noStudio.cardBody}>
            <Text style={noStudio.cardTitle}>Join a Studio</Text>
            <Text style={noStudio.cardDesc}>Enter the 6-character code from your studio admin</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={noStudio.card} onPress={() => router.push('/studio/create')} activeOpacity={0.82}>
          <View style={noStudio.cardIcon}>
            <Ionicons name="add-circle-outline" size={24} color={Colors.gold} />
          </View>
          <View style={noStudio.cardBody}>
            <Text style={noStudio.cardTitle}>Create a Studio</Text>
            <Text style={noStudio.cardDesc}>For sauna house operators — requires a creation token</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={noStudio.signOutBtn} onPress={signOut} activeOpacity={0.7}>
          <Text style={noStudio.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const noStudio = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl },
  title: { fontFamily: Typography.serifBold, fontSize: FontSize.display, color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: FontSize.md * 1.6, marginBottom: Spacing.xl },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  cardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.goldDim, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 2 },
  cardTitle: { fontFamily: Typography.sansMedium, fontSize: FontSize.md, color: Colors.textPrimary },
  cardDesc: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted },
  signOutBtn: { marginTop: Spacing.xl, alignItems: 'center', paddingVertical: Spacing.sm },
  signOutText: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted },
});

// ─── Studio card ──────────────────────────────────────────────────────────────
function StudioCard({ entry, onPress }: { entry: StudioEntry; onPress: () => void }) {
  const { purchaseStudioCreator, purchaseLoading } = usePurchase();
  const isAdmin = entry.role === 'admin';

  if (entry.locked) {
    return (
      <View style={[card.container, card.lockedContainer]}>
        <View style={card.lockedHeader}>
          <Ionicons name="lock-closed-outline" size={16} color={Colors.textMuted} />
          <Text style={card.lockedName}>{entry.studio.name}</Text>
        </View>
        {isAdmin ? (
          <>
            <Text style={card.lockedMsg}>Subscription paused — renew to restore access for your team.</Text>
            <TouchableOpacity
              style={[card.renewBtn, purchaseLoading && { opacity: 0.5 }]}
              onPress={purchaseStudioCreator}
              activeOpacity={0.85}
              disabled={purchaseLoading}
            >
              {purchaseLoading
                ? null
                : <Text style={card.renewBtnText}>Renew subscription</Text>
              }
            </TouchableOpacity>
          </>
        ) : (
          <Text style={card.lockedMsg}>This studio is temporarily unavailable. Contact your studio admin.</Text>
        )}
      </View>
    );
  }

  const memberCount = entry.members.length;
  const avatarMembers = entry.members.slice(0, 4);
  const overflow = memberCount > 4 ? memberCount - 4 : 0;

  function handleShareCode() {
    Share.share({ message: `Join ${entry.studio.name} on Aufguss — code: ${entry.studio.join_code}` });
  }

  return (
    <TouchableOpacity style={card.container} onPress={onPress} activeOpacity={0.82}>
      {/* Title row */}
      <View style={card.titleRow}>
        <View style={card.titleBlock}>
          <Text style={card.name}>{entry.studio.name}</Text>
          {entry.studio.location && (
            <View style={card.locationRow}>
              <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
              <Text style={card.location}>{entry.studio.location}</Text>
            </View>
          )}
        </View>
        <View style={card.roleBadge}>
          <Ionicons
            name={isAdmin ? 'shield-checkmark-outline' : 'person-outline'}
            size={10}
            color={isAdmin ? Colors.gold : Colors.textMuted}
          />
          <Text style={[card.roleText, isAdmin && card.roleTextAdmin]}>
            {isAdmin ? 'Admin' : 'Member'}
          </Text>
        </View>
      </View>

      {/* Description */}
      {entry.studio.description ? (
        <Text style={card.desc} numberOfLines={2}>{entry.studio.description}</Text>
      ) : null}

      {/* Admin-only section */}
      {isAdmin && (
        <>
          {/* Join code */}
          <View style={card.joinCodeRow}>
            <Ionicons name="key-outline" size={13} color={Colors.textMuted} />
            <Text style={card.joinCodeLabel}>Join code</Text>
            <Text style={card.joinCode}>{entry.studio.join_code}</Text>
            <TouchableOpacity
              onPress={handleShareCode}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Members */}
          <View style={card.membersRow}>
            <View style={card.avatars}>
              {avatarMembers.map((m, i) => {
                const name = m.profiles?.display_name || m.profiles?.email || '?';
                return (
                  <View key={m.user_id} style={[card.avatar, { marginLeft: i === 0 ? 0 : -8 }]}>
                    <Text style={card.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                  </View>
                );
              })}
              {overflow > 0 && (
                <View style={[card.avatar, card.avatarOverflow, { marginLeft: -8 }]}>
                  <Text style={card.avatarOverflowText}>+{overflow}</Text>
                </View>
              )}
            </View>
            <Text style={card.memberCount}>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </>
      )}

      {/* Member count (non-admin) */}
      {!isAdmin && (
        <Text style={card.memberCount}>{memberCount} {memberCount === 1 ? 'member' : 'members'}</Text>
      )}

      <View style={card.chevronRow}>
        <Text style={card.tapHint}>View oils &amp; sessions</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const card = StyleSheet.create({
  container: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
  titleBlock: { flex: 1, gap: 3 },
  name: { fontFamily: Typography.serifBold, fontSize: FontSize.xl, color: Colors.textPrimary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  location: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bg },
  roleText: { fontFamily: Typography.sansMedium, fontSize: FontSize.xxs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  roleTextAdmin: { color: Colors.gold },
  desc: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: FontSize.sm * 1.5 },
  joinCodeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.bg, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: 7, borderWidth: 1, borderColor: Colors.border },
  joinCodeLabel: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted, flex: 1 },
  joinCode: { fontFamily: Typography.serifBold, fontSize: FontSize.md, color: Colors.gold, letterSpacing: 3 },
  membersRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatars: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.goldDim, borderWidth: 1.5, borderColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: Typography.sansBold, fontSize: FontSize.xxs, color: Colors.gold },
  avatarOverflow: { backgroundColor: Colors.bgCard, borderColor: Colors.border },
  avatarOverflowText: { fontFamily: Typography.sansBold, fontSize: 9, color: Colors.textMuted },
  memberCount: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted, flex: 1 },
  chevronRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  tapHint: { fontFamily: Typography.sans, fontSize: FontSize.xs, color: Colors.textMuted },
  lockedContainer: { opacity: 0.75, borderColor: Colors.borderSubtle },
  lockedHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  lockedName: { fontFamily: Typography.serifBold, fontSize: FontSize.lg, color: Colors.textMuted, flex: 1 },
  lockedMsg: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted, lineHeight: FontSize.sm * 1.5 },
  renewBtn: { backgroundColor: Colors.goldDim, borderWidth: 1, borderColor: Colors.borderGold, borderRadius: Radius.md, paddingVertical: Spacing.sm, alignItems: 'center', marginTop: Spacing.xs },
  renewBtnText: { fontFamily: Typography.sansMedium, fontSize: FontSize.sm, color: Colors.gold },
});

// ─── Main Studio tab ──────────────────────────────────────────────────────────
export default function StudioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading, signOut } = useAuth();
  const { studios, loading, setActiveStudioId } = useStudio();

  if (authLoading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.gold} />
      </View>
    );
  }

  if (!user) return <AuthGate />;

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <GrainOverlay />
        <ActivityIndicator color={Colors.gold} />
      </View>
    );
  }

  if (studios.length === 0) return <NoStudio />;

  function handleCardPress(entry: StudioEntry) {
    if (entry.locked) return;
    setActiveStudioId(entry.studio.id);
    router.push(`/studio/${entry.studio.id}`);
  }

  return (
    <View style={styles.container}>
      <GrainOverlay />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Your Studios</Text>

        {studios.map(entry => (
          <StudioCard
            key={entry.studio.id}
            entry={entry}
            onPress={() => handleCardPress(entry)}
          />
        ))}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/studio/join')} activeOpacity={0.82}>
            <View style={styles.actionIcon}>
              <Ionicons name="enter-outline" size={20} color={Colors.gold} />
            </View>
            <View style={styles.actionBody}>
              <Text style={styles.actionTitle}>Join another Studio</Text>
              <Text style={styles.actionDesc}>Enter a 6-character code</Text>
            </View>
            <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/studio/create')} activeOpacity={0.82}>
            <View style={styles.actionIcon}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.gold} />
            </View>
            <View style={styles.actionBody}>
              <Text style={styles.actionTitle}>Create a Studio</Text>
              <Text style={styles.actionDesc}>Requires a creation token</Text>
            </View>
            <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={signOut} activeOpacity={0.7} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 40 },
  heading: { fontFamily: Typography.serifBold, fontSize: FontSize.display, color: Colors.textPrimary, marginBottom: Spacing.lg },
  actions: { marginTop: Spacing.md, gap: Spacing.sm },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing.md },
  actionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.goldDim, alignItems: 'center', justifyContent: 'center' },
  actionBody: { flex: 1, gap: 2 },
  actionTitle: { fontFamily: Typography.sansMedium, fontSize: FontSize.md, color: Colors.textPrimary },
  actionDesc: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted },
  signOutBtn: { marginTop: Spacing.xl, alignItems: 'center', paddingVertical: Spacing.sm },
  signOutText: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted },
});
