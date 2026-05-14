import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { useAuth } from './AuthContext';

const RC_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const ENTITLEMENT = 'studio_creator';

interface PurchaseContextValue {
  isStudioCreatorActive: boolean;
  purchaseLoading: boolean;
  priceString: string | null;
  purchaseStudioCreator: () => Promise<string | null>;
  restorePurchases: () => Promise<string | null>;
}

const PurchaseContext = createContext<PurchaseContextValue | null>(null);

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isStudioCreatorActive, setIsStudioCreatorActive] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [priceString, setPriceString] = useState<string | null>(null);

  const refreshEntitlement = useCallback(async () => {
    if (Platform.OS !== 'ios') return;
    try {
      const info = await Purchases.getCustomerInfo();
      setIsStudioCreatorActive(!!info.entitlements.active[ENTITLEMENT]);
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
        const pkg = offerings.current?.availablePackages.find(
          p => p.product.identifier === 'studio_admin_monthly'
        ) ?? offerings.current?.monthly ?? offerings.current?.availablePackages[0];
        console.log('[RC] package found:', JSON.stringify(pkg));
        if (pkg) setPriceString(pkg.product.priceString);
        else setPriceString('$19.99');
      }).catch((e) => console.log('[RC] offerings error:', e));
    }
  }, [user, refreshEntitlement]);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    // Listen for customer info updates (e.g. subscription renewal in background)
    Purchases.addCustomerInfoUpdateListener((info) => {
      setIsStudioCreatorActive(!!info.entitlements.active[ENTITLEMENT]);
    });
  }, []);

  async function purchaseStudioCreator(): Promise<string | null> {
    if (Platform.OS !== 'ios') return 'Subscriptions are only available on iOS';
    setPurchaseLoading(true);
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        p => p.product.identifier === 'studio_admin_monthly'
      ) ?? offerings.current?.monthly ?? offerings.current?.availablePackages[0];

      if (!pkg) return 'Subscription not available — please try again later';

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const active = !!customerInfo.entitlements.active[ENTITLEMENT];
      setIsStudioCreatorActive(active);
      return active ? null : 'Purchase completed but entitlement not found — please restore purchases';
    } catch (e: any) {
      if (e?.userCancelled) return 'cancelled';
      return e?.message ?? 'Purchase failed — please try again';
    } finally {
      setPurchaseLoading(false);
    }
  }

  async function restorePurchases(): Promise<string | null> {
    if (Platform.OS !== 'ios') return null;
    setPurchaseLoading(true);
    try {
      const info = await Purchases.restorePurchases();
      const active = !!info.entitlements.active[ENTITLEMENT];
      setIsStudioCreatorActive(active);
      return active ? null : 'No active subscription found';
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
