import React from 'react';
import { useOrbit } from '../../context/OrbitContext';

export function InviteModal() {
  const {
    groupId,
    groupName,
    inviteModalOpen,
    setInviteModalOpen,
    addToast
  } = useOrbit();

  if (!inviteModalOpen || !groupId) return null;

  const inviteLink =
    `${window.location.origin}${window.location.pathname}` +
    `#g=${encodeURIComponent(groupId)}` +
    `&n=${encodeURIComponent(groupName || '')}`;

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('INVITE MODAL: CLOSE CLICKED');

    setInviteModalOpen(false);
  };

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('INVITE MODAL: COPY CLICKED');

    try {
      await navigator.clipboard.writeText(inviteLink);

      addToast('Invite link copied!', 'success');

      console.log('INVITE MODAL: COPY SUCCESS');
    } catch (error) {
      console.error('Clipboard error:', error);

      // Fallback
      const textarea = document.createElement('textarea');

      textarea.value = inviteLink;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';

      document.body.appendChild(textarea);

      textarea.focus();
      textarea.select();

      try {
        document.execCommand('copy');
        addToast('Invite link copied!', 'success');
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        addToast('Copy failed. Please copy the link manually.', 'error');
      }

      document.body.removeChild(textarea);
    }
  };

  return (
    <div
      id="invite-modal"
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(4,7,14,.6)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        className="modal-card glass"
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={{
          position: 'relative',
          zIndex: 1000000,
          width: '100%',
          maxWidth: '400px',
          borderRadius: '20px',
          padding: '26px',
          pointerEvents: 'auto'
        }}
      >

        {/* CLOSE X */}

        <button
          type="button"
          className="modal-close"
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 1000001,
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--muted)',
            fontSize: '20px',
            cursor: 'pointer',
            pointerEvents: 'auto'
          }}
        >
          ✕
        </button>

        <h3
          style={{
            fontSize: '16px',
            marginBottom: '4px',
            paddingRight: '35px'
          }}
        >
          Invite your group
        </h3>

        <p
          style={{
            fontSize: '12px',
            color: 'var(--muted)',
            marginBottom: '18px',
            lineHeight: 1.5
          }}
        >
          Share this link — it opens the app already connected to{' '}
          <b style={{ color: 'var(--text)' }}>
            {groupName || groupId}
          </b>
          .
        </p>

        {/* LINK */}

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
            onClick={(e) => e.currentTarget.select()}
            style={{
              flex: 1,
              minWidth: 0,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--muted)',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              pointerEvents: 'auto'
            }}
          />

          <button
            type="button"
            className="copy-btn"
            onClick={handleCopy}
            style={{
              position: 'relative',
              zIndex: 1000001,
              background: 'rgba(0,229,255,.12)',
              color: 'var(--cyan)',
              border: '1px solid rgba(0,229,255,.3)',
              padding: '7px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              pointerEvents: 'auto',
              touchAction: 'manipulation'
            }}
          >
            COPY
          </button>
        </div>

        {/* CODE */}

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

        {/* CLOSE */}

        <button
          type="button"
          className="btn-ghost"
          onClick={handleClose}
        >
          Close
        </button>

      </div>
    </div>
  );
}