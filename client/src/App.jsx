import React, { useRef } from 'react';
import { useOrbit } from './context/OrbitContext';
import { OrbitMap } from './components/map/OrbitMap';
import { Topbar } from './components/layout/Topbar';
import { Sidebar } from './components/layout/Sidebar';
import { ControlBar } from './components/layout/ControlBar';
import { StatsStrip } from './components/layout/StatsStrip';
import { InviteModal } from './components/layout/InviteModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { ToastContainer } from './components/common/Toast';
import L from 'leaflet';

export function App() {
  const { joined, myPos, members } = useOrbit();

  const handleCenterMe = () => {
    window.dispatchEvent(new CustomEvent('orbit:centerMe'));
  };

  const handleFitAll = () => {
    const pts = Object.values(members)
      .filter(m => m.lat != null && m.lng != null)
      .map(m => [m.lat, m.lng]);

    if (pts.length === 0) return;
    window.dispatchEvent(new CustomEvent('orbit:fitAll', { detail: { pts } }));
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Map is always mounted in background */}
      <OrbitMap />

      {/* Onboarding Modal if not joined yet */}
      {!joined && <OnboardingModal />}

      {/* Main App HUD when joined */}
      {joined && (
        <div id="app" className="active" style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
          <Topbar />
          <StatsStrip />
          <Sidebar />
          <ControlBar onCenterMe={handleCenterMe} onFitAll={handleFitAll} />
          <InviteModal />
        </div>
      )}

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}

export default App;
