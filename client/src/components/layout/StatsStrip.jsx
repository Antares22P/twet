import React from 'react';
import { useOrbit } from '../../context/OrbitContext';
import { haversine, fmtDist } from '../../utils/geo';

export function StatsStrip() {
  const { members, links } = useOrbit();

  const entries = Object.entries(members).filter(([, m]) => m.lat != null && m.lng != null);
  if (entries.length < 2) return null;

  let minPair = null;
  let minD = Infinity;
  let maxD = 0;

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const d = haversine(
        entries[i][1].lat,
        entries[i][1].lng,
        entries[j][1].lat,
        entries[j][1].lng
      );
      if (d < minD) {
        minD = d;
        minPair = [entries[i][1].name || '?', entries[j][1].name || '?'];
      }
      if (d > maxD) maxD = d;
    }
  }

  const linkCount = Object.values(links).filter(v => v === true).length;

  return (
    <div
      id="stats-strip"
      className="glass"
      style={{
        position: 'absolute',
        top: 'calc(78px + var(--sat))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 19,
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '9px 18px',
        borderRadius: '14px',
        fontSize: '11.5px',
        color: 'var(--muted)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        maxWidth: 'calc(100vw - 32px)',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
      {minPair && (
        <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span
            className="stat-dot"
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--success)',
              flex: 'none'
            }}
          />
          Closest:{' '}
          <b style={{ color: 'var(--text)', fontWeight: 600 }}>
            {minPair[0]} ↔ {minPair[1]}
          </b>{' '}
          · {fmtDist(minD)}
        </div>
      )}

      <div className="stat-sep" style={{ width: '1px', height: '14px', background: 'var(--border)' }} />

      <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <span
          className="stat-dot"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--violet)',
            flex: 'none'
          }}
        />
        Group spread: <b style={{ color: 'var(--text)', fontWeight: 600 }}>{fmtDist(maxD)}</b>
      </div>

      {linkCount > 0 && (
        <>
          <div
            className="stat-sep"
            style={{ width: '1px', height: '14px', background: 'var(--border)' }}
          />
          <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span
              className="stat-dot"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--success)',
                flex: 'none'
              }}
            />
            🟢{' '}
            <b style={{ color: 'var(--text)', fontWeight: 600 }}>
              {linkCount}
            </b>{' '}
            active link{linkCount > 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
}
