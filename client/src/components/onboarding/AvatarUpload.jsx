import React from 'react';
import { Camera } from 'lucide-react';
import { initials } from '../../utils/geo';

export function AvatarUpload({ name, avatar, onAvatarChange }) {
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();
    reader.onload = ev => {
      img.src = ev.target.result;
    };
    img.onload = () => {
      const size = 128;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const s = Math.min(img.width, img.height);
      const sx = (img.width - s) / 2;
      const sy = (img.height - s) / 2;
      ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
      onAvatarChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '16px'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          flex: 'none',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
          fontWeight: 700,
          fontSize: '22px',
          color: '#04121a',
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,.15)'
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          initials(name) || '?'
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label
          htmlFor="avatar-file-input"
          style={{
            fontSize: '12px',
            padding: '8px 14px',
            borderRadius: '9px',
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,.04)',
            color: 'var(--text)',
            cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            width: 'fit-content',
            transition: '.2s'
          }}
        >
          <Camera size={14} /> Upload photo
        </label>
        <input
          type="file"
          id="avatar-file-input"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div
          style={{
            fontSize: '10.5px',
            color: 'var(--muted-2)',
            fontFamily: "'JetBrains Mono', monospace"
          }}
        >
          or we'll use your initials
        </div>
      </div>
    </div>
  );
}
