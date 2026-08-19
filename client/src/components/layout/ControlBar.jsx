import React from 'react';
import { useOrbit } from '../../context/OrbitContext';
import { Crosshair, Navigation, Maximize2, Share2, Target, GitCommit } from 'lucide-react';

export function ControlBar({ onCenterMe, onFitAll }) {
  const {
    linesVisible,
    setLinesVisible,
    followMe,
    setFollowMe,
    pickingDestination,
    setPickingDestination,
    setInviteModalOpen,
    myPos,
    addToast
  } = useOrbit();

  const handleLocate = () => {
    if (myPos) {
      onCenterMe();
    } else {
      addToast('Waiting for your location fix…');
    }
  };

  const handleFollowToggle = () => {
    const next = !followMe;
    setFollowMe(next);
    if (next && myPos) {
      onCenterMe();
      addToast('Follow mode on — map will track you', 'success');
    }
  };

  const handleDestToggle = () => {
    const next = !pickingDestination;
    setPickingDestination(next);
    if (next) {
      addToast('Tap anywhere on the map to drop your destination pin');
    }
  };

  return (
    <div
      id="controls"
      className="glass"
      style={{
        position: 'absolute',
        bottom: 'calc(16px + var(--sab))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '9px',
        borderRadius: '20px',
        pointerEvents: 'auto',
        maxWidth: 'calc(100vw - 24px)'
      }}
    >
      <button className="ctrl-btn" title="Center on me" onClick={handleLocate}>
        <Crosshair size={15} />
        <span className="lbl" style={{ marginLeft: '6px' }}>
          Me
        </span>
      </button>

      <button
        className={`ctrl-btn ${followMe ? 'on' : ''}`}
        title="Follow me"
        onClick={handleFollowToggle}
      >
        <Navigation size={15} />
        <span className="lbl" style={{ marginLeft: '6px' }}>
          Follow
        </span>
      </button>

      <button className="ctrl-btn" title="Fit all members" onClick={onFitAll}>
        <Maximize2 size={15} />
        <span className="lbl" style={{ marginLeft: '6px' }}>
          Fit All
        </span>
      </button>

      <button
        className={`ctrl-btn ${linesVisible ? 'on' : ''}`}
        title="Toggle distance mesh lines"
        onClick={() => setLinesVisible(prev => !prev)}
      >
        <GitCommit size={15} />
        <span className="lbl" style={{ marginLeft: '6px' }}>
          Mesh
        </span>
      </button>

      <div className="ctrl-sep" />

      <button
        className={`ctrl-btn ${pickingDestination ? 'on' : ''}`}
        title="Set your destination"
        onClick={handleDestToggle}
      >
        <Target size={15} />
        <span className="lbl" style={{ marginLeft: '6px' }}>
          Destination
        </span>
      </button>

      <div className="ctrl-sep" />

      <button
        className="ctrl-btn primary"
        title="Invite members"
        onClick={() => setInviteModalOpen(true)}
      >
        <Share2 size={15} />
        <span className="lbl" style={{ marginLeft: '6px' }}>
          Invite
        </span>
      </button>
    </div>
  );
}
