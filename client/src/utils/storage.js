import { LS_KEY } from '../constants/config';

export function getSavedSession() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s.groupId || !s.myId || !s.myName) return null;
    return s;
  } catch (e) {
    return null;
  }
}

export function saveSession(sessionData) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(sessionData));
  } catch (e) {
    console.warn('Failed to save session to localStorage', e);
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch (e) {
    console.warn('Failed to clear session', e);
  }
}
