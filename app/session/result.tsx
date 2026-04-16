import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import GrainOverlay from '../../components/GrainOverlay';
import { SessionSlot } from '../../data/recommendations';
import { useMyOils } from '../../hooks/useMyOils';
import { useMyIncense } from '../../hooks/useMyIncense';
import { useCustomLibrary } from '../../context/CustomLibraryContext';
import { TrioResult } from '../../components/TrioResult';
import { SwapModal } from '../../components/SwapModal';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import { FORM_META, IncenseForm } from '../../constants/incenseForms';
import { BotanicalIcon } from '../../components/BotanicalIcon';
import { EssentialOil } from '../../data/oils';
import { useSharedSession } from '../../store/sessionStore';

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

type SwapTarget =
  | { kind: 'slot'; slotIndex: number; oil: EssentialOil | null }
  | { kind: 'incense' };

export default function ResultScreen() {
  const router = useRouter();
  const { ownedIds } = useMyOils();
  const { ownedIncenseIds } = useMyIncense();
  const { customBlends } = useCustomLibrary();
  const session = useSharedSession();

  const [activeRound, setActiveRound] = useState(0);
  const [swapTarget, setSwapTarget] = useState<SwapTarget | null>(null);

  if (!session || !session.rounds || !session.vibe || !session.time) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No session generated yet.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.emptyBackBtn}>
          <Ionicons name="arrow-back-outline" size={14} color={Colors.gold} />
          <Text style={styles.emptyBackBtnText}>Back to Builder</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { rounds, vibe, time, manualSwapInRound, replaceSlotInRound,
    getSwapSuggestionForRound, getBrowseOilsForRound, setRoundIncense } = session;
  const currentRound = rounds[activeRound];

  const swapSuggestion = swapTarget?.kind === 'slot' && swapTarget.oil
    ? getSwapSuggestionForRound(activeRound, swapTarget.oil.id)
    : null;
  const browseOils = swapTarget?.kind === 'slot'
    ? getBrowseOilsForRound(activeRound, swapTarget.oil?.id ?? null)
    : [];

  const handleRegenerate = () => {
    session.regenerateRound(activeRound);
  };

  return (
    <View style={styles.container}>
      <GrainOverlay />
      <View style={[styles.screenHeader, { paddingTop: 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#f0e4c8" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.screenTitle}>Your Session</Text>
          <Text style={styles.headerMeta}>
            {vibe.charAt(0).toUpperCase() + vibe.slice(1)} · {time.charAt(0).toUpperCase() + time.slice(1)} · 3 rounds
          </Text>
        </View>
        <TouchableOpacity onPress={handleRegenerate} style={styles.regenBtn}>
          <Ionicons name="refresh-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Round tabs */}
        <View style={styles.roundTabs}>
          {rounds.map((_, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.roundTab, activeRound === i && styles.roundTabActive]}
              onPress={() => setActiveRound(i)}
              activeOpacity={0.75}
            >
              <Text style={[styles.roundTabText, activeRound === i && styles.roundTabTextActive]}>
                Round {i + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Slots */}
        <TrioResult
          slots={currentRound.slots}
          narrative={currentRound.narrative}
          vibe={vibe}
          time={time}
          ownedIds={ownedIds}
          onOilPress={oil => router.push(`/oil/${oil.id}`)}
          onSwapPress={(slotIndex, oil) => setSwapTarget({ kind: 'slot', slotIndex, oil })}
          onBlendPress={blend => router.push(`/blend/${blend.id}`)}
        />

        {/* Incense suggestion */}
        {currentRound.incense ? (
          <TouchableOpacity
            style={[styles.incenseCard, { borderLeftColor: FORM_META[currentRound.incense.form as IncenseForm].color }]}
            onPress={() => router.push(`/incense/${currentRound.incense!.id}`)}
            activeOpacity={0.85}
          >
            <View style={styles.incenseTitleRow}>
              <Ionicons name="flame-outline" size={13} color={FORM_META[currentRound.incense.form as IncenseForm].color} />
              <Text style={[styles.incenseLabel, { color: FORM_META[currentRound.incense.form as IncenseForm].color }]}>Atmosphere</Text>
            </View>
            <View style={styles.incenseBody}>
              <BotanicalIcon
                botanicalKey={INCENSE_BOTANICALS[currentRound.incense.id] ?? INCENSE_FORM_BOTANICALS[currentRound.incense.form] ?? 'resin-drop'}
                size={32}
                color="rgba(255,255,255,0.85)"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.incenseName}>{currentRound.incense.name}</Text>
                <Text style={styles.incenseOrigin}>{currentRound.incense.form} · {currentRound.incense.origin}</Text>
              </View>
            </View>
            <Text style={styles.incenseSaunaNote} numberOfLines={3}>{currentRound.incense.saunaNote}</Text>
            <View style={styles.incenseFooter}>
              <View style={styles.ownedStatus}>
                <Ionicons
                  name={ownedIncenseIds.has(currentRound.incense.id) ? 'checkmark-circle' : 'close-circle-outline'}
                  size={14}
                  color={ownedIncenseIds.has(currentRound.incense.id) ? Colors.gold : Colors.textMuted}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.ownedStatusText, ownedIncenseIds.has(currentRound.incense.id) ? { color: Colors.gold } : { color: Colors.textMuted }]}>
                  {ownedIncenseIds.has(currentRound.incense.id) ? 'In my kit' : 'Not in kit'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.swapBtn}
                onPress={() => setSwapTarget({ kind: 'incense' })}
                activeOpacity={0.8}
              >
                <Ionicons name="swap-horizontal-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.swapBtnText}>Swap</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() => router.push(`/incense/${currentRound.incense!.id}`)}
              >
                <Text style={styles.detailBtnText}>Details</Text>
                <Ionicons name="chevron-forward" size={12} color={Colors.gold} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.incenseCard, { borderLeftColor: Colors.goldDim }]}>
            <View style={styles.incenseTitleRow}>
              <Ionicons name="flame-outline" size={13} color={Colors.goldDim} />
              <Text style={[styles.incenseLabel, { color: Colors.goldDim }]}>Atmosphere</Text>
            </View>
            <View style={styles.incenseEmptyBody}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.textMuted} />
              <Text style={styles.incenseEmptyText}>No atmosphere selected</Text>
            </View>
            <View style={[styles.incenseFooter, { justifyContent: 'flex-end' }]}>
              <TouchableOpacity
                style={styles.swapBtn}
                onPress={() => setSwapTarget({ kind: 'incense' })}
                activeOpacity={0.8}
              >
                <Ionicons name="add-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.swapBtnText}>Add incense</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Empty kit prompts */}
        {session.kitOnly && (session.kitOilCount + (session.kitBlendCount ?? 0)) < 9 && (
          <TouchableOpacity style={styles.addToKitBtn} onPress={() => { router.dismissAll(); router.navigate('/(tabs)/library'); }} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={18} color={Colors.gold} />
            <Text style={styles.addToKitText}>Add oils to your kit</Text>
          </TouchableOpacity>
        )}

        {/* Usage guide */}
        <View style={styles.guideCard}>
          <View style={styles.guideTitleRow}>
            <Ionicons name="flame-outline" size={14} color="#e06050" />
            <Text style={styles.guideTitle}>How to Use</Text>
          </View>
          <Text style={styles.guideText}>
            Add 4–8 drops total to your ladle of water. Use a ratio guided by the intensity of each oil — lighter oils can go up to 4 drops each, strong oils 1–2 drops only. Swirl gently before pouring over the sauna stones.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Swap Modal */}
      <SwapModal
        visible={!!swapTarget}
        oilToReplace={swapTarget?.kind === 'slot' ? (swapTarget.oil ?? null) : null}
        suggestion={swapSuggestion}
        browseOils={browseOils}
        customBlends={customBlends}
        ownedIds={ownedIds}
        ownedIncenseIds={ownedIncenseIds}
        vibe={vibe}
        time={time}
        initialTab={
          swapTarget?.kind === 'incense' ? 'incense' :
          swapTarget?.kind === 'slot' && !swapTarget.oil ? 'oils' :
          undefined
        }
        onUseOil={oil => {
          if (swapTarget?.kind === 'slot') {
            if (swapTarget.oil) {
              manualSwapInRound(activeRound, swapTarget.oil.id, oil);
            } else {
              replaceSlotInRound(activeRound, swapTarget.slotIndex, { kind: 'oil', oil });
            }
          }
          setSwapTarget(null);
        }}
        onUseBlend={blend => {
          if (swapTarget?.kind === 'slot') {
            replaceSlotInRound(activeRound, swapTarget.slotIndex, { kind: 'blend', blend });
          }
          setSwapTarget(null);
        }}
        onUseIncense={incense => {
          setRoundIncense(activeRound, incense);
          setSwapTarget(null);
        }}
        onClose={() => setSwapTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  screenTitle: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xl,
    color: '#f0e4c8',
  },
  scroll: { flex: 1 },
  content: {
    padding: Spacing.lg,
  },
  empty: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  emptyText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
  },
  emptyBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.goldDim,
  },
  emptyBackBtnText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.md,
    color: Colors.gold,
  },
  headerMeta: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  regenBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  roundTabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  roundTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
  },
  roundTabActive: {
    borderColor: Colors.goldDim,
    backgroundColor: Colors.goldDim,
  },
  roundTabText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  roundTabTextActive: {
    color: Colors.gold,
  },
  guideTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  incenseCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: 0,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  incenseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  incenseLabel: {
    fontFamily: Typography.sansBold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  incenseBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  incenseName: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  incenseOrigin: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  incenseSaunaNote: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  incenseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ownedStatus: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  ownedStatusText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  detailBtnText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xs,
    color: Colors.gold,
  },
  swapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  swapBtnText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  addToKitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  incenseEmptyBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  incenseEmptyText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  addToKitText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.gold,
  },
  guideCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: '#c04030',
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  guideTitle: {
    fontFamily: Typography.sansBold,
    fontSize: FontSize.sm,
    color: '#e06050',
  },
  guideText: {
    fontFamily: Typography.sans,
    fontSize: FontSize.sm,
    lineHeight: 21,
    color: Colors.textSecondary,
  },
});
