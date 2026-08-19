import { PALETTE, WALK_SPEED_MPS } from '../constants/config';

export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function fmtDist(m) {
  if (m == null || isNaN(m)) return '—';
  if (m < 1000) return Math.round(m) + ' m';
  return (m / 1000).toFixed(m < 10000 ? 2 : 1) + ' km';
}

export function fmtAgo(ts) {
  if (!ts) return 'never';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return s + 's ago';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm ago';
  return Math.floor(m / 60) + 'h ago';
}

export function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function colorFor(id) {
  if (!id) return PALETTE[0];
  return PALETTE[hashCode(id) % PALETTE.length];
}

export function initials(name) {
  return (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

export function genGroupId() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

export function genMemberId() {
  return 'm_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function fmtEta(meters, speedMps) {
  const speed = speedMps && speedMps > 0.3 ? speedMps : WALK_SPEED_MPS;
  const secs = meters / speed;
  if (secs < 60) return '<1 min';
  const mins = Math.round(secs / 60);
  if (mins < 60) return mins + ' min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function fmtDuration(secs) {
  if (secs == null || isNaN(secs)) return '—';
  if (secs < 60) return '<1 min';
  const mins = Math.round(secs / 60);
  if (mins < 60) return mins + ' min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function accuracyTier(acc) {
  if (acc == null) return { label: '—', color: 'var(--muted-2)' };
  if (acc <= 15) return { label: 'Excellent', color: 'var(--success)' };
  if (acc <= 40) return { label: 'Good', color: 'var(--cyan)' };
  if (acc <= 80) return { label: 'Fair', color: 'var(--amber)' };
  return { label: 'Weak', color: 'var(--danger)' };
}

export function linkKey(id1, id2) {
  return id1 < id2 ? `${id1}|${id2}` : `${id2}|${id1}`;
}

export function destRouteKey(destId, memberId) {
  return `${destId}__${memberId}`;
}

export function vibrate(pattern) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch (e) {}
}

export function escapeHtml(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
