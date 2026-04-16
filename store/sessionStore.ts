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
