import React from 'react';
import { useOrbit } from '../../context/OrbitContext';

export function ToastContainer() {
  const { toasts } = useOrbit();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(20px + var(--sat))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
        width: 'calc(100vw - 32px)',
        alignItems: 'center'
      }}
    >
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast glass ${t.type || ''}`}
          style={{
            maxWidth: '100%',
            padding: '11px 18px',
            borderRadius: '12px',
            fontSize: '12.5px',
            fontWeight: 500,
            color: 'var(--text)',
            animation: 'toastIn .3s ease, toastOut .3s ease 2.7s forwards',
            boxShadow: '0 8px 24px rgba(0,0,0,.4)',
            textAlign: 'center',
            borderColor:
              t.type === 'error'
                ? 'rgba(255,77,109,.4)'
                : t.type === 'success'
                ? 'rgba(62,230,168,.4)'
                : 'var(--border)',
            background:
              t.type === 'error'
                ? 'rgba(30,10,16,.85)'
                : t.type === 'success'
                ? 'rgba(8,26,20,.85)'
                : 'var(--surface)'
          }}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
