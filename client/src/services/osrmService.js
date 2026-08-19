import {
  OSRM_BASE_URL,
  ROUTE_FETCH_TIMEOUT_MS,
  ROUTE_REFRESH_MS,
  ROUTE_REFRESH_DIST_M
} from '../constants/config';
import { haversine } from '../utils/geo';

// In-memory cache for client routes
const routeCache = {};

export function shouldRefreshRoute(routeKey, originLat, originLng, destLat, destLng) {
  const cache = routeCache[routeKey];
  if (!cache) return true;
  if (cache.fetching) return false;
  if (cache.destLat !== destLat || cache.destLng !== destLng) return true;
  const elapsed = Date.now() - (cache.fetchedAt || 0);
  if (elapsed < ROUTE_REFRESH_MS) return false;
  const moved = haversine(cache.originLat, cache.originLng, originLat, originLng);
  return moved >= ROUTE_REFRESH_DIST_M;
}

export function getCachedRoute(routeKey) {
  return routeCache[routeKey] || null;
}

export function clearRoutesForDestination(destId) {
  const prefix = `${destId}__`;
  Object.keys(routeCache).forEach(k => {
    if (k.startsWith(prefix)) {
      delete routeCache[k];
    }
  });
}

export async function fetchOsrmFootRoute(routeKey, originLat, originLng, destLat, destLng) {
  const prior = routeCache[routeKey];
  routeCache[routeKey] = {
    ...prior,
    fetching: true,
    originLat,
    originLng,
    destLat,
    destLng
  };

  const url = `${OSRM_BASE_URL}${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ROUTE_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      const route = data.routes[0];
      // Convert coordinates from [lng, lat] to Leaflet's [lat, lng]
      const latlngs = route.geometry.coordinates.map(c => [c[1], c[0]]);
      const result = {
        latlngs,
        distance: route.distance,
        duration: route.duration,
        fetchedAt: Date.now(),
        originLat,
        originLng,
        destLat,
        destLng,
        fetching: false,
        ok: true
      };
      routeCache[routeKey] = result;
      return result;
    } else {
      const fallback = {
        latlngs: [[originLat, originLng], [destLat, destLng]],
        distance: haversine(originLat, originLng, destLat, destLng),
        duration: haversine(originLat, originLng, destLat, destLng) / 1.35,
        fetchedAt: Date.now(),
        originLat,
        originLng,
        destLat,
        destLng,
        fetching: false,
        ok: false
      };
      routeCache[routeKey] = fallback;
      return fallback;
    }
  } catch (e) {
    clearTimeout(timeout);
    const fallback = {
      latlngs: [[originLat, originLng], [destLat, destLng]],
      distance: haversine(originLat, originLng, destLat, destLng),
      duration: haversine(originLat, originLng, destLat, destLng) / 1.35,
      fetchedAt: Date.now(),
      originLat,
      originLng,
      destLat,
      destLng,
      fetching: false,
      ok: false
    };
    routeCache[routeKey] = fallback;
    return fallback;
  }
}
