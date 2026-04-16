import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EssentialOil } from '../data/oils';
import { Blend } from '../data/blends';

const OILS_KEY = 'aufguss_custom_oils';
const BLENDS_KEY = 'aufguss_custom_blends';

interface CustomLibraryContextValue {
  customOils: EssentialOil[];
  customBlends: Blend[];
  addCustomOil: (oil: EssentialOil) => void;
  removeCustomOil: (oilId: string) => void;
  addCustomBlend: (blend: Blend) => void;
  removeCustomBlend: (blendId: string) => void;
  loaded: boolean;
}

const CustomLibraryContext = createContext<CustomLibraryContextValue>({
  customOils: [],
  customBlends: [],
  addCustomOil: () => {},
  removeCustomOil: () => {},
  addCustomBlend: () => {},
  removeCustomBlend: () => {},
  loaded: false,
});

export function CustomLibraryProvider({ children }: { children: React.ReactNode }) {
  const [customOils, setCustomOils] = useState<EssentialOil[]>([]);
  const [customBlends, setCustomBlends] = useState<Blend[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(OILS_KEY),
      AsyncStorage.getItem(BLENDS_KEY),
    ]).then(([oilsRaw, blendsRaw]) => {
      if (oilsRaw) try { setCustomOils(JSON.parse(oilsRaw)); } catch {}
      if (blendsRaw) try { setCustomBlends(JSON.parse(blendsRaw)); } catch {}
      setLoaded(true);
    });
  }, []);

  const addCustomOil = useCallback((oil: EssentialOil) => {
    setCustomOils(prev => {
      const next = [...prev, oil];
      AsyncStorage.setItem(OILS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeCustomOil = useCallback((oilId: string) => {
    setCustomOils(prev => {
      const next = prev.filter(o => o.id !== oilId);
      AsyncStorage.setItem(OILS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addCustomBlend = useCallback((blend: Blend) => {
    setCustomBlends(prev => {
      const next = [...prev, blend];
      AsyncStorage.setItem(BLENDS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeCustomBlend = useCallback((blendId: string) => {
    setCustomBlends(prev => {
      const next = prev.filter(b => b.id !== blendId);
      AsyncStorage.setItem(BLENDS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <CustomLibraryContext.Provider
      value={{ customOils, customBlends, addCustomOil, removeCustomOil, addCustomBlend, removeCustomBlend, loaded }}
    >
      {children}
    </CustomLibraryContext.Provider>
  );
}

export function useCustomLibrary() {
  return useContext(CustomLibraryContext);
}
