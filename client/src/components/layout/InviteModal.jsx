import React from 'react';
import { useOrbit } from '../../context/OrbitContext';

export function InviteModal() {
  const { groupId, groupName, inviteModalOpen, setInviteModalOpen, addToast } = useOrbit();

  if (!inviteModalOpen || !groupId) return null;

  const inviteLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}#g=${encodeURIComponent(
          groupId
        )}&n=${encodeURIComponent(groupName || '')}`
      : '';

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink).then(() => {
        addToast('Invite link copied!', 'success');
      });
    }
  };

  return (
    <div
      id="invite-modal"
      className="show"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        paddingTop: 'calc(20px + var(--sat))',
        paddingBottom: 'calc(20px + var(--sab))',
        background: 'rgba(4,7,14,.6)',
        backdropFilter: 'blur(4px)',
        overflowY: 'auto'
      }}
    >
      <div
        className="modal-card glass"
        style={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: '20px',
          padding: '26px',
          margin: 'auto'
        }}
      >
        <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Invite your group</h3>
<button
  className="modal-close"
  onClick={() => setInviteModalOpen(false)}
  style={{
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'transparent',
    border: 'none',
    color: 'var(--muted)',
    fontSize: '20px',
    cursor: 'pointer',
  }}
>
  ✕
</button>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--muted)',
            marginBottom: '18px',
            lineHeight: 1.5
          }}
        >
          Share this link — it opens the app already connected to{' '}
          <b style={{ color: 'var(--text)' }}>{groupName || groupId}</b>. Anyone with the link just
          adds their name & photo to join.
        </p>

        <div
          className="link-box"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,.04)',
            border: '1px solid var(--border)',
            borderRadius: '11px',
            padding: '10px 12px',
            marginBottom: '12px'
          }}
        >
          <input
            type="text"
            readOnly
            value={inviteLink}
            style={{
              flex: 1,
              minWidth: 0,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--muted)',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace"
            }}
          />
          <button
            className="copy-btn"
            onClick={handleCopy}
            style={{
              background: 'rgba(0,229,255,.12)',
              color: 'var(--cyan)',
              border: '1px solid rgba(0,229,255,.3)',
              padding: '7px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              flex: 'none',
              transition: '.2s'
            }}
          >
            COPY
          </button>
        </div>

        <div
          style={{
            fontSize: '10.5px',
            color: 'var(--muted-2)',
            textAlign: 'center',
            marginBottom: '6px'
          }}
        >
          — or share the code —
        </div>

        <div
          className="code-display"
          style={{
            textAlign: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '26px',
            letterSpacing: '6px',
            fontWeight: 700,
            color: 'var(--text)',
            padding: '16px',
            borderRadius: '13px',
            background: 'rgba(124,92,255,.08)',
            border: '1px dashed rgba(124,92,255,.35)',
            marginBottom: '14px'
          }}
        >
          {groupId}
        </div>

        <button className="btn-ghost" onClick={() => setInviteModalOpen(false)}>
          Close
        </button>
      </div>
    </div>
  );
}
