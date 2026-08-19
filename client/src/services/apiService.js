const API_BASE = '/api';

export async function createGroupApi(name) {
  try {
    const res = await fetch(`${API_BASE}/groups/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('API server error');
    return await res.json();
  } catch (err) {
    console.warn('Backend API unavailable, fallback to client-direct:', err);
    return null;
  }
}

export async function getGroupMetaApi(groupId) {
  try {
    const res = await fetch(`${API_BASE}/groups/${groupId}/meta`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchFootRouteProxy(originLat, originLng, destLat, destLng) {
  try {
    const res = await fetch(
      `${API_BASE}/routing/foot?originLat=${originLat}&originLng=${originLng}&destLat=${destLat}&destLng=${destLng}`
    );
    if (!res.ok) throw new Error('Proxy routing error');
    return await res.json();
  } catch (err) {
    return null;
  }
}
