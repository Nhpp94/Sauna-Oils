import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OILS, EssentialOil } from '../data/oils';
import { BLENDS, Blend } from '../data/blends';
import { INCENSE, Incense } from '../data/incense';
import { REMOTE_DATA_URLS } from '../constants/remoteConfig';

const CACHE_KEYS = {
  oils:    'remote_data_oils_v1',
  blends:  'remote_data_blends_v1',
  incense: 'remote_data_incense_v1',
};

interface RemoteData {
  oils: EssentialOil[];
  blends: Blend[];
  incense: Incense[];
}

const RemoteDataContext = createContext<RemoteData>({
  oils: OILS,
  blends: BLENDS,
  incense: INCENSE,
});

export function useRemoteData() {
  return useContext(RemoteDataContext);
}

export function RemoteDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<RemoteData>({ oils: OILS, blends: BLENDS, incense: INCENSE });

  useEffect(() => {
    async function load() {
      // Load cached remote data instantly on startup
      try {
        const [rawOils, rawBlends, rawIncense] = await Promise.all([
          AsyncStorage.getItem(CACHE_KEYS.oils),
          AsyncStorage.getItem(CACHE_KEYS.blends),
          AsyncStorage.getItem(CACHE_KEYS.incense),
        ]);
        const cached = {
          oils:    rawOils    ? (JSON.parse(rawOils)    as EssentialOil[]) : null,
          blends:  rawBlends  ? (JSON.parse(rawBlends)  as Blend[])        : null,
          incense: rawIncense ? (JSON.parse(rawIncense) as Incense[])      : null,
        };
        if (cached.oils || cached.blends || cached.incense) {
          setData(prev => ({
            oils:    cached.oils    ?? prev.oils,
            blends:  cached.blends  ?? prev.blends,
            incense: cached.incense ?? prev.incense,
          }));
        }
      } catch {}

      // Fetch fresh data in background
      try {
        const [oilsRes, blendsRes, incenseRes] = await Promise.all([
          fetch(REMOTE_DATA_URLS.oils),
          fetch(REMOTE_DATA_URLS.blends),
          fetch(REMOTE_DATA_URLS.incense),
        ]);
        if (!oilsRes.ok || !blendsRes.ok || !incenseRes.ok) return;
        const [oils, blends, incense] = await Promise.all([
          oilsRes.json()    as Promise<EssentialOil[]>,
          blendsRes.json()  as Promise<Blend[]>,
          incenseRes.json() as Promise<Incense[]>,
        ]);
        setData({ oils, blends, incense });
        await Promise.all([
          AsyncStorage.setItem(CACHE_KEYS.oils,    JSON.stringify(oils)),
          AsyncStorage.setItem(CACHE_KEYS.blends,  JSON.stringify(blends)),
          AsyncStorage.setItem(CACHE_KEYS.incense, JSON.stringify(incense)),
        ]);
      } catch {}
    }
    load();
  }, []);

  return (
    <RemoteDataContext.Provider value={data}>
      {children}
    </RemoteDataContext.Provider>
  );
}
