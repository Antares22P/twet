import React from 'react';
import { useOrbit } from '../../context/OrbitContext';
import { useSound } from '../../context/SoundContext';
import { accuracyTier } from '../../utils/geo';
import { Layers, Volume2, VolumeX, Users, LogOut } from 'lucide-react';

export function Topbar() {
  const {
    groupName,
    groupId,
    myPos,
    mapStyle,
    setMapStyle,
    sidebarCollapsed,
    setSidebarCollapsed,
    leaveGroup
  } = useOrbit();

  const { muted, toggleMute } = useSound();

  const acc = myPos ? myPos.coords.accuracy : null;
  const tier = accuracyTier(acc);

  return (
    <div
      id="topbar"
      style={{
        position: 'absolute',
        top: 'calc(16px + var(--sat))',
        left: 'calc(16px + var(--sal))',
        right: 'calc(16px + var(--sar))',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        pointerEvents: 'auto'
      }}
    >
      {/* Brand & Group Meta */}
      <div
        className="topbar-left glass"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '9px 16px 9px 10px',
          borderRadius: '16px',
          minWidth: 0
        }}
      >
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '9px',
            position: 'relative',
            flex: 'none',
            background: 'conic-gradient(from 220deg, var(--cyan), var(--violet), var(--cyan))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0,229,255,.35)'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '2px',
              borderRadius: '7px',
              background: 'var(--bg-2)'
            }}
          />
          <span
            style={{
              position: 'relative',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--cyan)',
              boxShadow: '0 0 8px var(--cyan)'
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>ORBIT</div>
          <div
            className="brand-sub"
            style={{
              fontSize: '9px',
              color: 'var(--muted)',
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            LIVE GROUP TRACKING
          </div>
        </div>

        {/* Group Name Chip */}
        <div
          className="group-chip"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            color: 'var(--muted)',
            paddingLeft: '12px',
            borderLeft: '1px solid var(--border-soft)',
            marginLeft: '2px',
            minWidth: 0
          }}
        >
          <span className="live-pulse" />
          <span>GROUP</span>
          <b
            style={{
              color: 'var(--cyan)',
              letterSpacing: '1px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '120px'
            }}
          >
            {groupName || groupId || '—'}
          </b>
        </div>

        {/* GPS Accuracy Chip */}
        {acc != null && (
          <div
            className="gps-chip"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '11px',
              color: 'var(--muted)',
              paddingLeft: '12px',
              borderLeft: '1px solid var(--border-soft)',
              marginLeft: '2px',
              flex: 'none'
            }}
          >
            <span
              className="gps-dot"
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: tier.color,
                boxShadow: `0 0 8px ${tier.color}`,
                flex: 'none'
              }}
            />
            <span className="gps-text mono" style={{ color: 'var(--text)', fontWeight: 500 }}>
              ±{Math.round(acc)}m · {tier.label}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className={`icon-btn ${mapStyle === 'satellite' ? 'on' : ''}`}
          title="Toggle map style"
          onClick={() => setMapStyle(prev => (prev === 'dark' ? 'satellite' : 'dark'))}
        >
          <Layers size={17} />
        </button>

        <button
          className={`icon-btn ${muted ? 'on' : ''}`}
          title="Toggle sound"
          onClick={toggleMute}
        >
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>

        <button
          className={`icon-btn ${!sidebarCollapsed ? 'on' : ''}`}
          title="Toggle members"
          onClick={() => setSidebarCollapsed(prev => !prev)}
        >
          <Users size={17} />
        </button>

        <button className="icon-btn danger" title="Leave group" onClick={leaveGroup}>
          <LogOut size={17} />
        </button>
      </div>
    </div>
  );
}
