import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { useOrbit } from '../../context/OrbitContext';
import {
  TILE_STYLES,
  MARKER_ANIM_MS,
  OFFLINE_MS
} from '../../constants/config';
import {
  haversine,
  fmtDist,
  fmtDuration,
  fmtEta,
  initials,
  accuracyTier,
  destRouteKey,
  linkKey,
  escapeHtml
} from '../../utils/geo';
import {
  shouldRefreshRoute,
  fetchOsrmFootRoute,
  getCachedRoute
} from '../../services/osrmService';

export function OrbitMap() {
  const {
    members,
    destinations,
    myId,
    myPos,
    firstFix,
    links,
    linkedMemberIds,
    mapStyle,
    linesVisible,
    followMe,
    setFollowMe,
    pickingDestination,
    setPickingDestination,
    setMyDestination,
    clearMyDestination
  } = useOrbit();

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Markers and Layer references
  const markersRef = useRef({});
  const prevPositionsRef = useRef({});
  const accuracyCircleRef = useRef(null);
  const meshLinesRef = useRef([]);
  const meshLabelsRef = useRef([]);
  const linkHubsRef = useRef({});
  const destMarkersRef = useRef({});
  const destLinesRef = useRef({});
  const destLabelsRef = useRef({});

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true
    }).setView([20, 0], 3);

    const cfg = TILE_STYLES.dark;
    const tileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      subdomains: cfg.subdomains || 'abc',
      maxZoom: cfg.maxZoom
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapRef.current = map;

    map.on('dragstart', () => {
      setFollowMe(false);
    });

    const onCenterMeEvent = () => {
      if (myPos && map) {
        map.setView([myPos.coords.latitude, myPos.coords.longitude], 17, { animate: true });
      }
    };

    const onFitAllEvent = e => {
      const pts = e.detail?.pts || [];
      if (pts.length === 1) {
        map.setView(pts[0], 16, { animate: true });
      } else if (pts.length > 1) {
        map.fitBounds(L.latLngBounds(pts), { padding: [70, 70] });
      }
    };

    window.addEventListener('orbit:centerMe', onCenterMeEvent);
    window.addEventListener('orbit:fitAll', onFitAllEvent);

    return () => {
      window.removeEventListener('orbit:centerMe', onCenterMeEvent);
      window.removeEventListener('orbit:fitAll', onFitAllEvent);
      map.remove();
      mapRef.current = null;
    };
  }, [setFollowMe]);

  // 2. Handle Tile Layer changes (Dark / Satellite)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const cfg = TILE_STYLES[mapStyle] || TILE_STYLES.dark;
    tileLayerRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      subdomains: cfg.subdomains || 'abc',
      maxZoom: cfg.maxZoom
    }).addTo(map);
  }, [mapStyle]);

  // 3. Handle Map Click for Destination Dropping
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onClick = e => {
      if (!pickingDestination) return;
      setMyDestination(e.latlng.lat, e.latlng.lng);
      setPickingDestination(false);
    };

    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [pickingDestination, setMyDestination, setPickingDestination]);

  // 4. Center / Follow Map on User GPS Fixes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !myPos) return;

    const lat = myPos.coords.latitude;
    const lng = myPos.coords.longitude;

    if (firstFix && !map._hasCenteredFirstFix) {
      map._hasCenteredFirstFix = true;
      map.setView([lat, lng], 16, { animate: true });
    } else if (followMe) {
      map.panTo([lat, lng], { animate: true, duration: 0.6 });
    }
  }, [myPos, firstFix, followMe]);

  // Marker animation function
  const animateMarker = useCallback((marker, fromLL, toLL) => {
    const dLat = toLL.lat - fromLL.lat;
    const dLng = toLL.lng - fromLL.lng;
    if (Math.abs(dLat) < 1e-9 && Math.abs(dLng) < 1e-9) return;

    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / MARKER_ANIM_MS);
      const ease = 1 - Math.pow(1 - t, 3);
      marker.setLatLng([fromLL.lat + dLat * ease, fromLL.lng + dLng * ease]);
      if (t < 1) {
        marker._orbitAnim = requestAnimationFrame(step);
      }
    }
    if (marker._orbitAnim) cancelAnimationFrame(marker._orbitAnim);
    marker._orbitAnim = requestAnimationFrame(step);
  }, []);

  // Build Marker HTML
  const buildMarkerHtml = useCallback(
    (id, m, isMe) => {
      const color = m.color || '#00e5ff';
      const avatarInner = m.avatar
        ? `<img src="${m.avatar}" alt="${escapeHtml(m.name)}" />`
        : initials(m.name);
      const speedKmh = m.speed && m.speed > 0.4 ? Math.round(m.speed * 3.6) : null;
      const heading = m.heading != null && !isNaN(m.heading) ? m.heading : null;
      const isLinked = linkedMemberIds.has(id);

      return `
        <div class="orbit-marker" style="--ring:${color}; --ring-glow:${color}88;">
          ${isMe ? '<div class="ring"></div>' : ''}
          ${
            heading != null
              ? `<div class="heading-arrow" style="transform:translateX(-50%) rotate(${heading}deg);"></div>`
              : ''
          }
          <div class="avatar">${avatarInner}</div>
          ${isLinked ? '<div class="link-badge"></div>' : ''}
          ${speedKmh ? `<div class="speed-badge">${speedKmh}<span>km/h</span></div>` : ''}
          <div class="label">${escapeHtml(m.name || 'Member')}${isMe ? ' · you' : ''}</div>
        </div>`;
    },
    [linkedMemberIds]
  );

  // 5. Render Member Markers & Accuracy Circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const seen = new Set();
    const now = Date.now();

    Object.entries(members).forEach(([id, m]) => {
      if (m.lat == null || m.lng == null) return;
      if (now - (m.updatedAt || 0) > OFFLINE_MS && id !== myId) return;

      seen.add(id);
      const isMe = id === myId;
      const icon = L.divIcon({
        html: buildMarkerHtml(id, m, isMe),
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const newLL = L.latLng(m.lat, m.lng);
      if (markersRef.current[id]) {
        const prev = prevPositionsRef.current[id];
        markersRef.current[id].setIcon(icon);
        if (prev) {
          animateMarker(markersRef.current[id], prev, newLL);
        } else {
          markersRef.current[id].setLatLng(newLL);
        }
      } else {
        markersRef.current[id] = L.marker(newLL, {
          icon,
          zIndexOffset: isMe ? 1000 : 0
        }).addTo(map);
      }
      prevPositionsRef.current[id] = newLL;

      // Accuracy circle for current user
      if (isMe) {
        const acc = m.accuracy || 0;
        const tier = accuracyTier(acc);
        if (!accuracyCircleRef.current) {
          accuracyCircleRef.current = L.circle(newLL, {
            radius: acc,
            color: tier.color,
            weight: 1,
            fillColor: tier.color,
            fillOpacity: 0.08,
            opacity: 0.35,
            interactive: false
          }).addTo(map);
        } else {
          accuracyCircleRef.current.setLatLng(newLL);
          accuracyCircleRef.current.setRadius(acc);
          accuracyCircleRef.current.setStyle({
            color: tier.color,
            fillColor: tier.color
          });
        }
      }
    });

    // Cleanup absent markers
    Object.keys(markersRef.current).forEach(id => {
      if (!seen.has(id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
        delete prevPositionsRef.current[id];
      }
    });
  }, [members, myId, buildMarkerHtml, animateMarker]);

  // 6. Render Proximity Link Beams
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old hubs
    Object.keys(linkHubsRef.current).forEach(k => {
      map.removeLayer(linkHubsRef.current[k].beam);
      map.removeLayer(linkHubsRef.current[k].hub);
    });
    linkHubsRef.current = {};

    Object.keys(links).forEach(key => {
      if (links[key] !== true) return;
      const [id1, id2] = key.split('|');
      const m1 = members[id1];
      const m2 = members[id2];
      if (!m1 || !m2 || m1.lat == null || m2.lat == null) return;

      const dist = haversine(m1.lat, m1.lng, m2.lat, m2.lng);
      const beam = L.polyline(
        [
          [m1.lat, m1.lng],
          [m2.lat, m2.lng]
        ],
        {
          color: '#3ee6a8',
          weight: 3,
          opacity: 0.85,
          className: 'link-beam'
        }
      ).addTo(map);

      const midLat = (m1.lat + m2.lat) / 2;
      const midLng = (m1.lng + m2.lng) / 2;
      const hub = L.marker([midLat, midLng], {
        icon: L.divIcon({
          html: `<div class="link-hub"><div class="link-hub-ring"></div><div class="link-hub-core"></div><div class="link-hub-chip">🟢 ${fmtDist(
            dist
          )}</div></div>`,
          className: '',
          iconSize: [0, 0]
        }),
        interactive: false,
        zIndexOffset: 900
      }).addTo(map);

      linkHubsRef.current[key] = { beam, hub };
    });
  }, [links, members]);

  // 7. Render Distance Mesh Lines
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    meshLinesRef.current.forEach(l => map.removeLayer(l));
    meshLabelsRef.current.forEach(l => map.removeLayer(l));
    meshLinesRef.current = [];
    meshLabelsRef.current = [];

    if (!linesVisible) return;

    const entries = Object.entries(members).filter(
      ([id, m]) => m.lat != null && m.lng != null && markersRef.current[id]
    );

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [id1, m1] = entries[i];
        const [id2, m2] = entries[j];
        if (links[linkKey(id1, id2)] === true) continue; // Rendered as proximity beam

        const line = L.polyline(
          [
            [m1.lat, m1.lng],
            [m2.lat, m2.lng]
          ],
          {
            color: '#00e5ff',
            weight: 1.4,
            opacity: 0.35,
            dashArray: '4,6'
          }
        ).addTo(map);
        meshLinesRef.current.push(line);

        const dist = haversine(m1.lat, m1.lng, m2.lat, m2.lng);
        const midLat = (m1.lat + m2.lat) / 2;
        const midLng = (m1.lng + m2.lng) / 2;

        const chip = L.marker([midLat, midLng], {
          icon: L.divIcon({
            html: `<div class="dist-chip">${fmtDist(dist)}</div>`,
            className: '',
            iconSize: [0, 0]
          }),
          interactive: false
        }).addTo(map);
        meshLabelsRef.current.push(chip);
      }
    }
  }, [members, links, linesVisible]);

  // 8. Render Destination Pins & OSRM Walkable Routes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const seenDest = new Set();

    Object.entries(destinations).forEach(([destId, d]) => {
      const owner = members[destId];
      if (!d || d.lat == null || !owner) return;
      seenDest.add(destId);

      const ownerColor = owner.color || '#00e5ff';
      const isMineDest = destId === myId;

      // Destination Pin Marker
      const icon = L.divIcon({
        html: `<div class="dest-marker" style="--ring:${ownerColor};"><svg width="26" height="34" viewBox="0 0 26 34"><path d="M13 33C13 33 24 20.4 24 12.5C24 6.15 19.18 1 13 1C6.82 1 2 6.15 2 12.5C2 20.4 13 33 13 33Z" fill="${ownerColor}" stroke="#070a12" stroke-width="1.5"/><circle cx="13" cy="12.5" r="4.5" fill="#070a12"/></svg></div>`,
        className: '',
        iconSize: [26, 34],
        iconAnchor: [13, 34]
      });

      if (destMarkersRef.current[destId]) {
        destMarkersRef.current[destId].setLatLng([d.lat, d.lng]);
        destMarkersRef.current[destId].setIcon(icon);
      } else {
        const marker = L.marker([d.lat, d.lng], { icon, zIndexOffset: 500 }).addTo(map);
        marker.on('click', () => {
          if (isMineDest && window.confirm('Clear your destination pin?')) {
            clearMyDestination();
          }
        });
        destMarkersRef.current[destId] = marker;
      }

      if (!destLinesRef.current[destId]) destLinesRef.current[destId] = {};
      if (!destLabelsRef.current[destId]) destLabelsRef.current[destId] = {};

      const seenMembers = new Set();

      // Render routes from each member to this destination
      Object.entries(members).forEach(([memberId, m]) => {
        if (m.lat == null || m.lng == null) return;
        seenMembers.add(memberId);

        const routeKey = destRouteKey(destId, memberId);
        const memberColor = m.color || '#00e5ff';

        if (destLinesRef.current[destId][memberId]) {
          map.removeLayer(destLinesRef.current[destId][memberId]);
        }
        if (destLabelsRef.current[destId][memberId]) {
          map.removeLayer(destLabelsRef.current[destId][memberId]);
        }

        // Fetch OSRM route if needed
        if (shouldRefreshRoute(routeKey, m.lat, m.lng, d.lat, d.lng)) {
          fetchOsrmFootRoute(routeKey, m.lat, m.lng, d.lat, d.lng).then(() => {
            // Re-render when route is received
            const latestRoute = getCachedRoute(routeKey);
            if (latestRoute && mapRef.current) {
              // Rerender trigger
            }
          });
        }

        const routeCache = getCachedRoute(routeKey);
        const hasRoute =
          routeCache &&
          routeCache.ok &&
          routeCache.latlngs &&
          routeCache.latlngs.length > 1 &&
          routeCache.destLat === d.lat &&
          routeCache.destLng === d.lng;

        const pathLatLngs = hasRoute
          ? routeCache.latlngs
          : [
              [m.lat, m.lng],
              [d.lat, d.lng]
            ];
        const routeDist = hasRoute
          ? routeCache.distance
          : haversine(m.lat, m.lng, d.lat, d.lng);
        const etaLabel = hasRoute
          ? fmtDuration(routeCache.duration)
          : fmtEta(routeDist, m.speed);
        const routeIcon = hasRoute ? '🚶' : '🎯';
        const nameTag = memberId === destId ? '' : `${escapeHtml(m.name || 'Member')} · `;

        destLinesRef.current[destId][memberId] = L.polyline(pathLatLngs, {
          color: memberColor,
          weight: hasRoute ? 3.5 : 2,
          opacity: hasRoute ? 0.75 : 0.55,
          dashArray: hasRoute ? null : '2,7',
          lineJoin: 'round'
        }).addTo(map);

        const midPoint = pathLatLngs[Math.floor(pathLatLngs.length / 2)];
        destLabelsRef.current[destId][memberId] = L.marker(midPoint, {
          icon: L.divIcon({
            html: `<div class="dist-chip" style="border-color:${memberColor}88; color:${memberColor};">${nameTag}${routeIcon} ${fmtDist(
              routeDist
            )} · ${etaLabel}</div>`,
            className: '',
            iconSize: [0, 0]
          }),
          interactive: false
        }).addTo(map);
      });

      // Cleanup left members
      Object.keys(destLinesRef.current[destId]).forEach(memberId => {
        if (!seenMembers.has(memberId)) {
          map.removeLayer(destLinesRef.current[destId][memberId]);
          delete destLinesRef.current[destId][memberId];
          if (destLabelsRef.current[destId][memberId]) {
            map.removeLayer(destLabelsRef.current[destId][memberId]);
            delete destLabelsRef.current[destId][memberId];
          }
        }
      });
    });

    // Cleanup deleted destinations
    Object.keys(destMarkersRef.current).forEach(destId => {
      if (!seenDest.has(destId)) {
        map.removeLayer(destMarkersRef.current[destId]);
        delete destMarkersRef.current[destId];
        if (destLinesRef.current[destId]) {
          Object.values(destLinesRef.current[destId]).forEach(l => map.removeLayer(l));
          delete destLinesRef.current[destId];
        }
        if (destLabelsRef.current[destId]) {
          Object.values(destLabelsRef.current[destId]).forEach(l => map.removeLayer(l));
          delete destLabelsRef.current[destId];
        }
      }
    });
  }, [destinations, members, myId, clearMyDestination]);

  return (
    <div
      ref={mapContainerRef}
      id="map"
      className={pickingDestination ? 'picking' : ''}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        background: '#0b0f1a',
        cursor: pickingDestination ? 'crosshair' : 'grab'
      }}
    />
  );
}
