import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudio } from '../../context/StudioContext';
import { usePurchase } from '../../context/PurchaseContext';
import { Colors, Typography, FontSize, Spacing, Radius } from '../../constants/theme';
import GrainOverlay from '../../components/GrainOverlay';

type Step = 'paywall' | 'details';

export default function CreateStudioScreen() {
  const router = useRouter();
  const { createStudio, studios } = useStudio();
  const { isStudioCreatorActive, purchaseLoading, priceString, purchaseStudioCreator, restorePurchases } = usePurchase();
  const hasPaidStudio = useMemo(
    () => studios.some(entry => entry.role === 'admin' && entry.studio.created_via === 'paid'),
    [studios],
  );

  const [step, setStep] = useState<Step>(isStudioCreatorActive ? 'details' : 'paywall');
  const [promoCode, setPromoCode] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);

  // ─── Paywall step ───────────────────────────────────────────────────────────

  async function handleSubscribe() {
    setPurchaseError(null);
    setRestoreMsg(null);
    const err = await purchaseStudioCreator();
    if (err === null) {
      if (hasPaidStudio) {
        setPurchaseError('Your subscription includes one studio. You already have a studio for this subscription.');
      } else {
        setStep('details');
      }
    } else if (err !== 'cancelled') {
      setPurchaseError(err);
    }
  }

  async function handleRestore() {
    setPurchaseError(null);
    setRestoreMsg(null);
    const err = await restorePurchases();
    if (err === null) {
      if (hasPaidStudio) {
        setRestoreMsg('Your subscription is active and already connected to one studio.');
      } else {
        setStep('details');
      }
    } else {
      setRestoreMsg(err);
    }
  }

  async function handleRedeemPromo() {
    setPromoError(null);
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    const { supabase } = await import('../../lib/supabase');
    const { data, error } = await supabase
      .from('promo_codes').select('used_at').eq('token', code).maybeSingle();
    console.log('[promo] code:', code, 'data:', data, 'error:', error);
    setPromoLoading(false);
    if (!data) { setPromoError(error?.message ?? 'Invalid promo code'); return; }
    if (data.used_at) { setPromoError('This promo code has already been used'); return; }
    setPromoCode(code);
    setStep('details');
  }

  // ─── Details step ───────────────────────────────────────────────────────────

  async function handleCreate() {
    if (!name.trim()) return;
    if (!promoCode && hasPaidStudio) {
      setCreateError('Your subscription includes one studio. You already have a studio for this subscription.');
      return;
    }
    setCreateError(null);
    setCreateLoading(true);
    const err = await createStudio(name, description, location, promoCode || undefined);
    setCreateLoading(false);
    if (err) {
      setCreateError(err);
    } else {
      router.back();
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GrainOverlay />
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="close" size={22} color={Colors.textMuted} />
      </TouchableOpacity>

      {step === 'paywall' ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.iconWrap}>
            <Ionicons name="business-outline" size={40} color={Colors.gold} />
          </View>

          <Text style={styles.title}>Create a Studio</Text>
          <Text style={styles.subtitle}>
            Share oils, build sessions, and coordinate with your team — all in one place.
          </Text>

          {/* Subscription card */}
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{priceString ?? '—'}</Text>
              <Text style={styles.pricePeriod}> / month</Text>
            </View>
            <Text style={styles.priceDesc}>
              Create and run one studio — unlimited oils, sessions, and members.
            </Text>
            <View style={styles.featureList}>
              {['Shared oil catalog', 'Pre-built session library', 'Team member management', 'Cancel any time'].map(f => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.gold} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>

          {purchaseError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color={Colors.spicy} />
              <Text style={styles.errorText}>{purchaseError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, purchaseLoading && styles.btnDisabled]}
            onPress={handleSubscribe}
            activeOpacity={0.85}
            disabled={purchaseLoading}
          >
            {purchaseLoading
              ? <ActivityIndicator size="small" color={Colors.bg} />
              : <Text style={styles.primaryBtnText}>Subscribe — {priceString ?? '...'} / month</Text>
            }
          </TouchableOpacity>

          {restoreMsg && (
            <Text style={styles.restoreMsg}>{restoreMsg}</Text>
          )}
          <TouchableOpacity onPress={handleRestore} activeOpacity={0.7} style={styles.restoreBtn} disabled={purchaseLoading}>
            <Text style={styles.restoreBtnText}>Restore purchases</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Promo code */}
          <Text style={styles.promoLabel}>Have a partner code?</Text>
          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="PROMO CODE"
              placeholderTextColor={Colors.textMuted}
              value={promoInput}
              onChangeText={v => { setPromoInput(v.toUpperCase()); setPromoError(null); }}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleRedeemPromo}
            />
            <TouchableOpacity
              style={[styles.redeemBtn, (!promoInput.trim() || promoLoading) && styles.btnDisabled]}
              onPress={handleRedeemPromo}
              activeOpacity={0.85}
              disabled={!promoInput.trim() || promoLoading}
            >
              {promoLoading
                ? <ActivityIndicator size="small" color={Colors.bg} />
                : <Text style={styles.redeemBtnText}>Redeem</Text>
              }
            </TouchableOpacity>
          </View>

          {promoError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color={Colors.spicy} />
              <Text style={styles.errorText}>{promoError}</Text>
            </View>
          )}

          <Text style={styles.legalText}>
            Subscriptions auto-renew monthly. Cancel any time in your Apple ID settings.
          </Text>
        </ScrollView>

      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {!isStudioCreatorActive && (
            <TouchableOpacity style={styles.backBtn} onPress={() => { setStep('paywall'); setCreateError(null); }} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={16} color={Colors.textMuted} />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}

          <View style={[styles.iconWrap, { marginTop: isStudioCreatorActive ? Spacing.xl : 0 }]}>
            <Ionicons name="business-outline" size={40} color={Colors.gold} />
          </View>

          <Text style={styles.title}>Studio Details</Text>
          <Text style={styles.subtitle}>
            {promoCode
              ? 'Partner code applied — set up your studio below.'
              : hasPaidStudio
              ? 'Your subscription already has a studio. Manage your existing studio from the Studio tab.'
              : 'Name your studio and add some context for your team.'}
          </Text>

          <View style={styles.promoAppliedBadge}>
            <Ionicons
              name={promoCode ? 'checkmark-circle' : 'card-outline'}
              size={14}
              color={promoCode ? Colors.success : Colors.gold}
            />
            <Text style={styles.promoAppliedText}>
              {promoCode ? 'Partner code applied' : 'Subscription active'}
            </Text>
          </View>

          {hasPaidStudio && !promoCode && (
            <View style={styles.limitBox}>
              <Ionicons name="business-outline" size={16} color={Colors.gold} />
              <Text style={styles.limitText}>
                One active subscription can create one studio. Use your existing studio, or redeem a partner code for a separate studio.
              </Text>
            </View>
          )}

          <Text style={styles.fieldLabel}>Studio name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Nordisk Saunaklubb"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={styles.fieldLabel}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="City or address (optional)"
            placeholderTextColor={Colors.textMuted}
            value={location}
            onChangeText={setLocation}
            returnKeyType="next"
          />

          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="A short description for your team (optional)"
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            returnKeyType="done"
          />

          {createError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color={Colors.spicy} />
              <Text style={styles.errorText}>{createError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, (!name.trim() || createLoading || (hasPaidStudio && !promoCode)) && styles.btnDisabled]}
            onPress={handleCreate}
            activeOpacity={0.85}
            disabled={!name.trim() || createLoading || (hasPaidStudio && !promoCode)}
          >
            {createLoading
              ? <ActivityIndicator size="small" color={Colors.bg} />
              : <Text style={styles.primaryBtnText}>Create Studio</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  closeBtn: { position: 'absolute', top: Spacing.lg, right: Spacing.lg, zIndex: 10, padding: Spacing.sm },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl, paddingBottom: Spacing.xxl, alignItems: 'center' },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.goldDim, borderWidth: 1, borderColor: Colors.borderGold, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  title: { fontFamily: Typography.serifBold, fontSize: FontSize.xxl, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: FontSize.md * 1.6, paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  priceCard: { width: '100%', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.borderGold, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontFamily: Typography.serifBold, fontSize: FontSize.hero, color: Colors.gold },
  pricePeriod: { fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textMuted },
  priceDesc: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: FontSize.sm * 1.5 },
  featureList: { gap: 6, marginTop: Spacing.xs },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  featureText: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textPrimary },
  primaryBtn: { backgroundColor: Colors.gold, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', width: '100%', marginTop: Spacing.sm },
  primaryBtnText: { fontFamily: Typography.sansBold, fontSize: FontSize.md, color: Colors.bg },
  btnDisabled: { opacity: 0.4 },
  restoreBtn: { paddingVertical: Spacing.sm, marginTop: Spacing.xs },
  restoreBtnText: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted, textDecorationLine: 'underline' },
  restoreMsg: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xs },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, width: '100%', marginVertical: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted },
  promoLabel: { fontFamily: Typography.sansMedium, fontSize: FontSize.sm, color: Colors.textSecondary, alignSelf: 'flex-start', marginBottom: Spacing.sm },
  promoRow: { flexDirection: 'row', gap: Spacing.sm, width: '100%' },
  promoInput: { flex: 1, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontFamily: Typography.sansMedium, fontSize: FontSize.md, color: Colors.textPrimary, letterSpacing: 2 },
  redeemBtn: { backgroundColor: Colors.goldDim, borderWidth: 1, borderColor: Colors.borderGold, borderRadius: Radius.md, paddingHorizontal: Spacing.md, alignItems: 'center', justifyContent: 'center' },
  redeemBtnText: { fontFamily: Typography.sansMedium, fontSize: FontSize.sm, color: Colors.gold },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.errorBg, borderWidth: 1, borderColor: Colors.errorBorder, borderRadius: Radius.md, padding: Spacing.md, width: '100%', marginTop: Spacing.sm },
  errorText: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.errorText, flex: 1 },
  limitBox: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.borderGold, borderRadius: Radius.md, padding: Spacing.md, width: '100%', marginBottom: Spacing.md },
  limitText: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1, lineHeight: FontSize.sm * 1.45 },
  legalText: { fontFamily: Typography.sans, fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.lg, lineHeight: FontSize.xs * 1.6, paddingHorizontal: Spacing.md },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', paddingVertical: Spacing.xs, marginBottom: Spacing.md },
  backBtnText: { fontFamily: Typography.sans, fontSize: FontSize.sm, color: Colors.textMuted },
  promoAppliedBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, marginBottom: Spacing.lg },
  promoAppliedText: { fontFamily: Typography.sansMedium, fontSize: FontSize.sm, color: Colors.textSecondary },
  fieldLabel: { fontFamily: Typography.sansMedium, fontSize: FontSize.sm, color: Colors.textSecondary, alignSelf: 'flex-start', marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: { width: '100%', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontFamily: Typography.sans, fontSize: FontSize.md, color: Colors.textPrimary },
  textArea: { height: 90, textAlignVertical: 'top' },
});
