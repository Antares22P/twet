import React, { useRef, useEffect } from 'react';
import { useOrbit } from '../../context/OrbitContext';
import {
  haversine,
  fmtDist,
  fmtAgo,
  initials,
  fmtDuration,
  fmtEta,
  destRouteKey
} from '../../utils/geo';
import { STALE_MS, OFFLINE_MS } from '../../constants/config';
import { getCachedRoute } from '../../services/osrmService';

export function Sidebar() {
  const {
    members,
    destinations,
    myId,
    myPos,
    linkedMemberIds,
    sidebarCollapsed,
    setSidebarCollapsed,
    clearMyDestination
  } = useOrbit();

  const handleRef = useRef(null);
  const touchStartY = useRef(null);
  const startHeight = useRef(0);

  // Swipe-down-to-close on mobile sheet handle
  useEffect(() => {
    const handleEl = handleRef.current;
    if (!handleEl) return;

    const onTouchStart = e => {
      touchStartY.current = e.touches[0].clientY;
      const sb = handleEl.closest('#sidebar');
      if (sb) {
        startHeight.current = sb.getBoundingClientRect().height;
        sb.style.transition = 'none';
      }
    };

    const onTouchMove = e => {
      if (touchStartY.current == null) return;
      const dy = e.touches[0].clientY - touchStartY.current;
      const sb = handleEl.closest('#sidebar');
      if (dy > 0 && sb) {
        sb.style.transform = `translateY(${dy}px)`;
      }
    };

    const onTouchEnd = e => {
      if (touchStartY.current == null) return;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      const sb = handleEl.closest('#sidebar');
      if (sb) {
        sb.style.transition = '';
        sb.style.transform = '';
        if (dy > startHeight.current * 0.28) {
          setSidebarCollapsed(true);
        }
      }
      touchStartY.current = null;
    };

    handleEl.addEventListener('touchstart', onTouchStart, { passive: true });
    handleEl.addEventListener('touchmove', onTouchMove, { passive: true });
    handleEl.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      handleEl.removeEventListener('touchstart', onTouchStart);
      handleEl.removeEventListener('touchmove', onTouchMove);
      handleEl.removeEventListener('touchend', onTouchEnd);
    };
  }, [setSidebarCollapsed]);

  const now = Date.now();
  const entries = Object.entries(members).filter(([, m]) => m.lat != null && m.lng != null);

  entries.sort((a, b) => {
    if (a[0] === myId) return -1;
    if (b[0] === myId) return 1;
    const da = myPos ? haversine(myPos.coords.latitude, myPos.coords.longitude, a[1].lat, a[1].lng) : 0;
    const db = myPos ? haversine(myPos.coords.latitude, myPos.coords.longitude, b[1].lat, b[1].lng) : 0;
    return da - db;
  });

  return (
    <div
      id="sidebar"
      className={`glass ${sidebarCollapsed ? 'collapsed' : ''}`}
      style={{
        position: 'absolute',
        top: 'calc(78px + var(--sat))',
        right: 'calc(16px + var(--sar))',
        bottom: 'calc(96px + var(--sab))',
        width: '296px',
        zIndex: 20,
        borderRadius: '20px',
        padding: '16px 14px',
        display: 'flex',
        flexDirection: 'column',
        transition: '.3s cubic-bezier(.2,.9,.25,1)',
        transform: sidebarCollapsed ? 'translateX(340px)' : 'none',
        opacity: sidebarCollapsed ? 0 : 1,
        pointerEvents: sidebarCollapsed ? 'none' : 'auto'
      }}
    >
      {/* Mobile handle */}
      <div
        ref={handleRef}
        className="sb-handle"
        onClick={() => setSidebarCollapsed(true)}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          padding: '0 2px'
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1.4px',
            color: 'var(--muted)',
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: 'uppercase'
          }}
        >
          Members
        </div>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--cyan)',
            fontFamily: "'JetBrains Mono', monospace",
            background: 'rgba(0,229,255,.1)',
            padding: '2px 8px',
            borderRadius: '20px'
          }}
        >
          {entries.length}
        </div>
      </div>

      {/* Member list */}
      <div
        id="members-list"
        style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1,
          paddingRight: '2px'
        }}
      >
        {entries.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--muted-2)',
              fontSize: '11.5px',
              padding: '30px 10px',
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 1.7
            }}
          >
            Waiting for members to appear…<br />Share the invite to get your group live.
          </div>
        ) : (
          entries.map(([id, m]) => {
            const isMe = id === myId;
            const age = now - (m.updatedAt || 0);
            const statusClass = age < STALE_MS ? 'online' : age < OFFLINE_MS ? 'stale' : '';
            const isLinked = linkedMemberIds.has(id);
            const speedKmh =
              m.speed && m.speed > 0.4 ? `${Math.round(m.speed * 3.6)} km/h` : age < STALE_MS ? 'stationary' : '';
            let metaText = age < STALE_MS ? speedKmh || 'live' : fmtAgo(m.updatedAt);
            if (isMe && m.accuracy) metaText += ` · ±${Math.round(m.accuracy)}m`;
            if (isLinked) metaText += ' · 🟢 linked';

            let distAway = null;
            if (!isMe && myPos) {
              distAway = haversine(myPos.coords.latitude, myPos.coords.longitude, m.lat, m.lng);
            }

            // Destination info
            const dest = destinations[id];
            let destInfo = null;
            if (dest && dest.lat != null) {
              const routeKey = destRouteKey(id, id);
              const routeCache = getCachedRoute(routeKey);
              const hasRoute =
                routeCache &&
                routeCache.ok &&
                routeCache.latlngs &&
                routeCache.destLat === dest.lat &&
                routeCache.destLng === dest.lng;

              const dd = hasRoute
                ? routeCache.distance
                : haversine(m.lat, m.lng, dest.lat, dest.lng);
              const eta = hasRoute ? fmtDuration(routeCache.duration) : fmtEta(dd, m.speed);
              const routeTag = hasRoute ? '🚶' : '🎯';
              destInfo = { dd, eta, routeTag };
            }

            return (
              <div
                key={id}
                className={`member-card ${isMe ? 'me' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 10px',
                  borderRadius: '13px',
                  background: isMe ? 'rgba(0,229,255,.05)' : 'rgba(255,255,255,.025)',
                  border: isMe ? '1px solid rgba(0,229,255,.3)' : '1px solid var(--border-soft)',
                  position: 'relative',
                  animation: 'cardIn .35s ease'
                }}
              >
                {/* Avatar */}
                <div
                  className={`m-avatar ${isLinked ? 'linked' : ''}`}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    flex: 'none',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#04121a',
                    overflow: 'hidden',
                    border: `2px solid ${m.color || '#00e5ff'}`
                  }}
                >
                  {m.avatar ? (
                    <img
                      src={m.avatar}
                      alt={m.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    initials(m.name)
                  )}
                  <span
                    className={`m-status ${statusClass}`}
                    style={{
                      position: 'absolute',
                      bottom: '-1px',
                      right: '-1px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      border: '2px solid var(--surface-solid)',
                      background:
                        statusClass === 'online'
                          ? 'var(--success)'
                          : statusClass === 'stale'
                          ? 'var(--amber)'
                          : 'var(--muted-2)',
                      boxShadow: statusClass === 'online' ? '0 0 6px var(--success)' : 'none'
                    }}
                  />
                  {isLinked && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-2px',
                        left: '-2px',
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        background: 'var(--success)',
                        border: '2px solid var(--surface-solid)',
                        boxShadow: '0 0 6px var(--success)'
                      }}
                    />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{m.name || 'Member'}</span>
                    {isMe && (
                      <span
                        style={{
                          fontSize: '9px',
                          color: 'var(--cyan)',
                          fontFamily: "'JetBrains Mono', monospace",
                          background: 'rgba(0,229,255,.12)',
                          padding: '1px 5px',
                          borderRadius: '5px',
                          fontWeight: 600
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '10.5px',
                      color: 'var(--muted-2)',
                      fontFamily: "'JetBrains Mono', monospace",
                      marginTop: '1px',
                      display: 'flex',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {metaText}
                  </div>

                  {/* Destination Progress */}
                  {destInfo && (
                    <div className="dest-row">
                      <span>
                        {destInfo.routeTag} {fmtDist(destInfo.dd)} to go · ETA {destInfo.eta}
                      </span>
                      {isMe && (
                        <span
                          className="dest-clear"
                          onClick={e => {
                            e.stopPropagation();
                            clearMyDestination();
                          }}
                        >
                          Clear
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Distance Away */}
                {distAway != null && (
                  <div style={{ textAlign: 'right', flex: 'none' }}>
                    <b
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--cyan)'
                      }}
                    >
                      {fmtDist(distAway)}
                    </b>
                    <span
                      style={{
                        fontSize: '9px',
                        color: 'var(--muted-2)',
                        textTransform: 'uppercase',
                        letterSpacing: '.5px'
                      }}
                    >
                      away
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
