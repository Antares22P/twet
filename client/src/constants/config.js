export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCW0DasqEJk7GVmQDJbxNeVO-LDWmni_RA",
  authDomain: "orbitpoint-c9ee5.firebaseapp.com",
  databaseURL: "https://orbitpoint-c9ee5-default-rtdb.firebaseio.com",
  projectId: "orbitpoint-c9ee5",
  appId: "1:377856134157:web:6fb2d2fe8d10cc5f261944"
};

export const PALETTE = [
  '#00e5ff', '#ff6b9d', '#ffb703', '#7cff6b', '#7c5cff',
  '#ff8c42', '#4dd4ac', '#ff4d6d', '#5ec8ff', '#e879f9'
];

export const STALE_MS = 25000;      // Amber after 25s
export const OFFLINE_MS = 60000;    // Gray/hide after 60s
export const LS_KEY = 'orbit_session_v1';
export const ARRIVAL_RADIUS_M = 30; // Considered "arrived" within 30m
export const MARKER_ANIM_MS = 550; // Smooth glide duration
export const WALK_SPEED_MPS = 1.35; // ~4.9 km/h walking speed
export const LINK_CONNECT_M = 50;  // Proximity auto-connect range
export const LINK_BREAK_M = 75;    // Proximity disconnect range (hysteresis)

export const OSRM_BASE_URL = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot/';
export const ROUTE_REFRESH_MS = 15000;
export const ROUTE_REFRESH_DIST_M = 25;
export const ROUTE_FETCH_TIMEOUT_MS = 8000;

export const TILE_STYLES = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
  }
};
