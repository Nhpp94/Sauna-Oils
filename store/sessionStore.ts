// Module-level store so the session result screen can read
// the session state set by either the tab or the stack session screen.
import { useState, useEffect } from 'react';

let _sharedSession: any = null;
const listeners = new Set<() => void>();

export function setSharedSession(s: any) {
  _sharedSession = s;
  listeners.forEach(l => l());
}

export function getSharedSession() {
  return _sharedSession;
}

export function useSharedSession() {
  const [, rerender] = useState(0);
  useEffect(() => {
    const notify = () => rerender(n => n + 1);
    listeners.add(notify);
    return () => { listeners.delete(notify); };
  }, []);
  return _sharedSession;
}

// Pending load: saved-sessions screen sets this before navigating to /session
// so session/index.tsx can hydrate and forward to /session/result.
let _pendingLoad: any = null;

export function setPendingLoad(saved: any) {
  _pendingLoad = saved;
}

export function getPendingLoad() {
  return _pendingLoad;
}

export function clearPendingLoad() {
  _pendingLoad = null;
}

// Active saved session ID — set when a saved session is loaded so result.tsx can auto-save changes back
let _activeSavedSessionId: string | null = null;

export function setActiveSavedSessionId(id: string | null) {
  _activeSavedSessionId = id;
}

export function getActiveSavedSessionId() {
  return _activeSavedSessionId;
}
