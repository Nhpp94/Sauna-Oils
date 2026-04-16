import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OILS_KEY = 'aufguss_owned_oils';
const INCENSE_KEY = 'aufguss_owned_incense';

interface MyKitContextValue {
  ownedIds: Set<string>;
  isOwned: (id: string) => boolean;
  toggleOwned: (id: string) => void;
  ownedIncenseIds: Set<string>;
  isOwnedIncense: (id: string) => boolean;
  toggleOwnedIncense: (id: string) => void;
  loaded: boolean;
}

const MyKitContext = createContext<MyKitContextValue>({
  ownedIds: new Set(),
  isOwned: () => false,
  toggleOwned: () => {},
  ownedIncenseIds: new Set(),
  isOwnedIncense: () => false,
  toggleOwnedIncense: () => {},
  loaded: false,
});

export function MyKitProvider({ children }: { children: React.ReactNode }) {
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [ownedIncenseIds, setOwnedIncenseIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(OILS_KEY),
      AsyncStorage.getItem(INCENSE_KEY),
    ]).then(([oilsRaw, incenseRaw]) => {
      if (oilsRaw) try { setOwnedIds(new Set(JSON.parse(oilsRaw))); } catch {}
      if (incenseRaw) try { setOwnedIncenseIds(new Set(JSON.parse(incenseRaw))); } catch {}
      setLoaded(true);
    });
  }, []);

  const toggleOwned = useCallback((oilId: string) => {
    setOwnedIds(prev => {
      const next = new Set(prev);
      if (next.has(oilId)) { next.delete(oilId); } else { next.add(oilId); }
      AsyncStorage.setItem(OILS_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const toggleOwnedIncense = useCallback((incenseId: string) => {
    setOwnedIncenseIds(prev => {
      const next = new Set(prev);
      if (next.has(incenseId)) { next.delete(incenseId); } else { next.add(incenseId); }
      AsyncStorage.setItem(INCENSE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isOwned = useCallback((id: string) => ownedIds.has(id), [ownedIds]);
  const isOwnedIncense = useCallback((id: string) => ownedIncenseIds.has(id), [ownedIncenseIds]);

  return (
    <MyKitContext.Provider value={{ ownedIds, isOwned, toggleOwned, ownedIncenseIds, isOwnedIncense, toggleOwnedIncense, loaded }}>
      {children}
    </MyKitContext.Provider>
  );
}

export function useMyOils() {
  const { ownedIds, isOwned, toggleOwned, loaded } = useContext(MyKitContext);
  return { ownedIds, isOwned, toggleOwned, loaded };
}

export function useMyIncense() {
  const { ownedIncenseIds, isOwnedIncense, toggleOwnedIncense, loaded } = useContext(MyKitContext);
  return { ownedIncenseIds, isOwnedIncense, toggleOwnedIncense, loaded };
}
