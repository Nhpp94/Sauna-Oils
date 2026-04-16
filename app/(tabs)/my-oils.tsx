import React, { useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { OILS } from '../../data/oils';
import { INCENSE } from '../../data/incense';
import { useMyOils } from '../../hooks/useMyOils';
import { useMyIncense } from '../../hooks/useMyIncense';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import GrainOverlay from '../../components/GrainOverlay';
import { CATEGORY_META } from '../../constants/categories';
import { FORM_META, IncenseForm } from '../../constants/incenseForms';
import { OilIcon } from '../../components/OilIcon';
import { BotanicalIcon } from '../../components/BotanicalIcon';

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

export default function MyOilsScreen() {
  const router = useRouter();
  const { ownedIds, isOwned, toggleOwned } = useMyOils();
  const { ownedIncenseIds, isOwnedIncense, toggleOwnedIncense } = useMyIncense();

  const ownedOils = OILS.filter(o => isOwned(o.id)).sort((a, b) => a.name.localeCompare(b.name));
  const ownedIncense = INCENSE.filter(i => isOwnedIncense(i.id)).sort((a, b) => a.name.localeCompare(b.name));
  const [activeTab, setActiveTab] = useState<'oils' | 'incense'>('oils');

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
    paddingHorizontal: Spacing.lg,
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
  sectionHeader: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.md,
    color: Colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
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
  rowNotOwned: {
    opacity: 0.5,
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
  rowNameNotOwned: {
    color: Colors.textMuted,
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
});
