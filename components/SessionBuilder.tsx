import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Vibe, TimeOfDay } from '../data/oils';
import { Colors, Typography, FontSize, Spacing, Radius } from '../constants/theme';
import { VIBE_META, VIBE_ICONS, TIME_ICONS } from '../constants/icons';

interface Props {
  selectedVibe: Vibe | null;
  selectedTime: TimeOfDay | null;
  onVibeChange: (v: Vibe) => void;
  onTimeChange: (t: TimeOfDay) => void;
  onGenerate: () => void;
  oilSource: 'all' | 'kit' | 'studio';
  onOilSourceChange: (v: 'all' | 'kit' | 'studio') => void;
  oilCount: number;
  studioName?: string;
}

const VIBES = VIBE_META;

const TIMES: { value: TimeOfDay; label: string; desc: string }[] = [
  { value: 'morning',   label: 'Morning',   desc: 'Sunrise ritual' },
  { value: 'afternoon', label: 'Afternoon', desc: 'Midday reset' },
  { value: 'evening',   label: 'Evening',   desc: 'Wind-down' },
];

export function SessionBuilder({ selectedVibe, selectedTime, onVibeChange, onTimeChange, onGenerate, oilSource, onOilSourceChange, oilCount, studioName }: Props) {
  const canGenerate = !!selectedVibe && !!selectedTime;

  return (
    <View style={styles.container}>
      {/* Vibe Section */}
      <Text style={styles.sectionLabel}>Choose your vibe</Text>
      <View style={styles.vibeRow}>
        {VIBES.map(v => {
          const active = selectedVibe === v.value;
          return (
            <TouchableOpacity
              key={v.value}
              style={[
                styles.vibeTile,
                active && { borderColor: v.color, backgroundColor: v.color + '15' },
              ]}
              onPress={() => onVibeChange(v.value)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={VIBE_ICONS[v.value] as any}
                size={24}
                color={active ? v.color : Colors.textMuted}
              />
              <Text style={[styles.vibeTileLabel, active && { color: v.color }]}>{v.label}</Text>
              <Text style={styles.vibeTileDesc}>{v.desc}</Text>
              {active && <View style={[styles.activeDot, { backgroundColor: v.color }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Time Section */}
      <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>Time of day</Text>
      <View style={styles.timeRow}>
        {TIMES.map(t => {
          const active = selectedTime === t.value;
          return (
            <TouchableOpacity
              key={t.value}
              style={[styles.timeTile, active && styles.timeTileActive]}
              onPress={() => onTimeChange(t.value)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={TIME_ICONS[t.value] as any}
                size={22}
                color={active ? Colors.gold : Colors.textMuted}
              />
              <Text style={[styles.timeTileLabel, active && styles.timeTileLabelActive]}>{t.label}</Text>
              <Text style={styles.timeTileDesc}>{t.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Source toggle */}
      <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>Select oils from</Text>
      <View style={styles.sourceToggle}>
        <TouchableOpacity
          style={[styles.sourceSeg, oilSource === 'all' && styles.sourceSegActive]}
          onPress={() => onOilSourceChange('all')}
          activeOpacity={0.75}
        >
          <Ionicons name="library-outline" size={13} color={oilSource === 'all' ? Colors.gold : Colors.textMuted} />
          <Text style={[styles.sourceSegText, oilSource === 'all' && styles.sourceSegTextActive]}>Full Library</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sourceSeg, oilSource === 'kit' && styles.sourceSegActive]}
          onPress={() => onOilSourceChange('kit')}
          activeOpacity={0.75}
        >
          <Ionicons name="briefcase-outline" size={13} color={oilSource === 'kit' ? Colors.gold : Colors.textMuted} />
          <Text style={[styles.sourceSegText, oilSource === 'kit' && styles.sourceSegTextActive]}>
            {oilSource === 'kit' && oilCount > 0 ? `My Kit · ${oilCount}` : 'My Kit'}
          </Text>
        </TouchableOpacity>
        {studioName !== undefined && (
          <TouchableOpacity
            style={[styles.sourceSeg, oilSource === 'studio' && styles.sourceSegActive]}
            onPress={() => onOilSourceChange('studio')}
            activeOpacity={0.75}
          >
            <Ionicons name="business-outline" size={13} color={oilSource === 'studio' ? Colors.gold : Colors.textMuted} />
            <Text style={[styles.sourceSegText, oilSource === 'studio' && styles.sourceSegTextActive]} numberOfLines={1}>
              {studioName}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Generate Button */}
      <TouchableOpacity
        style={[styles.generateBtn, !canGenerate && styles.generateBtnDisabled]}
        onPress={onGenerate}
        disabled={!canGenerate}
        activeOpacity={0.8}
      >
        <Text style={[styles.generateBtnText, !canGenerate && styles.generateBtnTextDisabled]}>
          Generate My Session
        </Text>
        <Ionicons name="arrow-forward" size={18} color={canGenerate ? Colors.bg : 'rgba(13,8,6,0.4)'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  sectionLabel: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  vibeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  vibeTile: {
    width: '31%',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  vibeTileLabel: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  vibeTileDesc: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  activeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  timeTile: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  timeTileActive: {
    borderColor: Colors.goldDim,
    backgroundColor: Colors.goldDim,
  },
  timeTileLabel: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  timeTileLabelActive: {
    color: Colors.gold,
  },
  timeTileDesc: {
    fontFamily: Typography.sans,
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  sourceToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
    gap: 3,
  },
  sourceSeg: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  sourceSegActive: {
    backgroundColor: Colors.goldDim,
  },
  sourceSegText: {
    fontFamily: Typography.sansMedium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  sourceSegTextActive: {
    color: Colors.gold,
  },
  generateBtn: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.gold,
  },
  generateBtnDisabled: {
    backgroundColor: 'rgba(212,151,58,0.3)',
  },
  generateBtnText: {
    fontFamily: Typography.serifBold,
    fontSize: FontSize.lg,
    color: Colors.bg,
  },
  generateBtnTextDisabled: {
    color: 'rgba(13,8,6,0.5)',
  },
});
