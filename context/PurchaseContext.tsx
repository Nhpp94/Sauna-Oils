import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { useAuth } from './AuthContext';

const RC_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const PRODUCT_ID = process.env.EXPO_PUBLIC_REVENUECAT_STUDIO_PRODUCT_ID ?? 'studio_admin_monthly';
const ENTITLEMENTS = (process.env.EXPO_PUBLIC_REVENUECAT_STUDIO_ENTITLEMENT ?? 'studio_creator,Sauna Oils Studio')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

interface PurchaseContextValue {
  isStudioCreatorActive: boolean;
  purchaseLoading: boolean;
  priceString: string | null;
  purchaseStudioCreator: () => Promise<string | null>;
  restorePurchases: () => Promise<string | null>;
}

const PurchaseContext = createContext<PurchaseContextValue | null>(null);

function getActiveEntitlementIds(info: any) {
  return Object.keys(info?.entitlements?.active ?? {});
}

function hasStudioEntitlement(info: any) {
  return ENTITLEMENTS.some(id => !!info?.entitlements?.active?.[id]);
}

function entitlementErrorMessage(info: any) {
  const activeIds = getActiveEntitlementIds(info);
  const expected = ENTITLEMENTS.join('" or "');
  const suffix = activeIds.length > 0
    ? ` Active entitlement: ${activeIds.join(', ')}.`
    : ' No active entitlements were returned.';
  return `Purchase completed, but RevenueCat did not return the expected "${expected}" entitlement.${suffix}`;
}

function findStudioPackage(offerings: any) {
  return offerings.current?.availablePackages.find(
    (p: any) => p.product.identifier === PRODUCT_ID
  ) ?? offerings.current?.monthly ?? offerings.current?.availablePackages[0];
}

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isStudioCreatorActive, setIsStudioCreatorActive] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [priceString, setPriceString] = useState<string | null>(null);

  const refreshEntitlement = useCallback(async () => {
    if (Platform.OS !== 'ios') return;
    try {
      const info = await Purchases.getCustomerInfo();
      setIsStudioCreatorActive(hasStudioEntitlement(info));
    } catch {
      setIsStudioCreatorActive(false);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'ios' || !RC_API_KEY) return;
    Purchases.setLogLevel(LOG_LEVEL.ERROR);
    if (user) {
      Purchases.configure({ apiKey: RC_API_KEY, appUserID: user.id });
      refreshEntitlement();
      Purchases.getOfferings().then(offerings => {
        console.log('[RC] current offering:', JSON.stringify(offerings.current));
        const pkg = findStudioPackage(offerings);
        console.log('[RC] package found:', JSON.stringify(pkg));
        if (pkg) setPriceString(pkg.product.priceString);
        else setPriceString('$19.99');
      }).catch((e) => console.log('[RC] offerings error:', e));
    }
  }, [user, refreshEntitlement]);

  useEffect(() => {
    if (Platform.OS !== 'ios' || !RC_API_KEY) return;
    // Listen for customer info updates (e.g. subscription renewal in background)
    Purchases.addCustomerInfoUpdateListener((info) => {
      setIsStudioCreatorActive(hasStudioEntitlement(info));
    });
  }, []);

  async function purchaseStudioCreator(): Promise<string | null> {
    if (Platform.OS !== 'ios') return 'Subscriptions are only available on iOS';
    if (!RC_API_KEY) return 'RevenueCat is not configured for this build';
    setPurchaseLoading(true);
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = findStudioPackage(offerings);

      if (!pkg) return 'Subscription not available — please try again later';

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      let active = hasStudioEntitlement(customerInfo);
      let latestInfo = customerInfo;

      if (!active) {
        latestInfo = await Purchases.getCustomerInfo();
        active = hasStudioEntitlement(latestInfo);
      }

      setIsStudioCreatorActive(active);
      return active ? null : entitlementErrorMessage(latestInfo);
    } catch (e: any) {
      if (e?.userCancelled) return 'cancelled';
      return e?.message ?? 'Purchase failed — please try again';
    } finally {
      setPurchaseLoading(false);
    }
  }

  async function restorePurchases(): Promise<string | null> {
    if (Platform.OS !== 'ios') return null;
    if (!RC_API_KEY) return 'RevenueCat is not configured for this build';
    setPurchaseLoading(true);
    try {
      const info = await Purchases.restorePurchases();
      const active = hasStudioEntitlement(info);
      setIsStudioCreatorActive(active);
      return active ? null : entitlementErrorMessage(info);
    } catch (e: any) {
      return e?.message ?? 'Restore failed';
    } finally {
      setPurchaseLoading(false);
    }
  }

  return (
    <PurchaseContext.Provider value={{ isStudioCreatorActive, purchaseLoading, priceString, purchaseStudioCreator, restorePurchases }}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  const ctx = useContext(PurchaseContext);
  if (!ctx) throw new Error('usePurchase must be used within PurchaseProvider');
  return ctx;
}
