import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vibe, TimeOfDay } from '../data/oils';
import { SessionTrio } from '../data/recommendations';

const SESSIONS_KEY = 'aufguss_saved_sessions';

export interface SavedSession {
  id: string;
  name: string;
  createdAt: number;
  source: 'generated' | 'built';
  vibe: Vibe | null;
  time: TimeOfDay | null;
  rounds: SessionTrio[];
}

interface SavedSessionsContextValue {
  savedSessions: SavedSession[];
  saveSession: (data: Omit<SavedSession, 'id' | 'createdAt'>) => void;
  updateSession: (id: string, rounds: SessionTrio[]) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, name: string) => void;
  loaded: boolean;
}

const SavedSessionsContext = createContext<SavedSessionsContextValue>({
  savedSessions: [],
  saveSession: () => {},
  updateSession: () => {},
  deleteSession: () => {},
  renameSession: () => {},
  loaded: false,
});

export function SavedSessionsProvider({ children }: { children: React.ReactNode }) {
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SESSIONS_KEY).then(raw => {
      if (raw) try { setSavedSessions(JSON.parse(raw)); } catch {}
      setLoaded(true);
    });
  }, []);

  const persist = (sessions: SavedSession[]) => {
    AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  };

  const saveSession = useCallback((data: Omit<SavedSession, 'id' | 'createdAt'>) => {
    const id = `saved_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const entry: SavedSession = { id, createdAt: Date.now(), ...data };
    setSavedSessions(prev => {
      const next = [entry, ...prev];
      persist(next);
      return next;
    });
  }, []);

  const updateSession = useCallback((id: string, rounds: SessionTrio[]) => {
    setSavedSessions(prev => {
      const next = prev.map(s => s.id === id ? { ...s, rounds } : s);
      persist(next);
      return next;
    });
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSavedSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const renameSession = useCallback((id: string, name: string) => {
    setSavedSessions(prev => {
      const next = prev.map(s => s.id === id ? { ...s, name } : s);
      persist(next);
      return next;
    });
  }, []);

  return (
    <SavedSessionsContext.Provider value={{ savedSessions, saveSession, updateSession, deleteSession, renameSession, loaded }}>
      {children}
    </SavedSessionsContext.Provider>
  );
}

export function useSavedSessions() {
  return useContext(SavedSessionsContext);
}
