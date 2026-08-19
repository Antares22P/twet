import React, { useState, useEffect } from 'react';
import { useOrbit } from '../../context/OrbitContext';
import { AvatarUpload } from './AvatarUpload';
import { genGroupId } from '../../utils/geo';
import { createGroupApi } from '../../services/apiService';
import { ArrowRight } from 'lucide-react';

export function OnboardingModal() {
  const { joined, joinGroup } = useOrbit();

  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('create');
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [myName, setMyName] = useState('');
  const [myAvatar, setMyAvatar] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState(null);
  const [inviteBanner, setInviteBanner] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Parse invite link hash on load: #g=XYZ123&n=GroupName
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    const idx = hash.indexOf('g=');
    if (idx !== -1) {
      const params = new URLSearchParams(hash.slice(idx === 0 ? 1 : 1));
      const g = params.get('g');
      const n = params.get('n');
      if (g) {
        setSelectedGroupId(g);
        setSelectedGroupName(n || `Group ${g}`);
        setInviteBanner({ g, n });
        setActiveTab('join');
      }
    }
  }, []);

  if (joined) return null;

  const handleStep1Next = async () => {
    setErrorMsg('');
    if (inviteBanner) {
      setStep(2);
      return;
    }

    if (activeTab === 'create') {
      const gname = groupName.trim() || 'Untitled Group';
      setLoading(true);
      // Try to create via backend API, fallback to client generation
      const apiResult = await createGroupApi(gname);
      const gid = apiResult ? apiResult.groupId : genGroupId();
      setSelectedGroupId(gid);
      setSelectedGroupName(gname);
      setLoading(false);
      setStep(2);
    } else {
      const raw = joinCode.trim();
      let gid = null;
      let gname = null;
      const hashIdx = raw.indexOf('#g=');
      if (hashIdx !== -1) {
        const params = new URLSearchParams(raw.slice(hashIdx + 1));
        gid = params.get('g');
        gname = params.get('n');
      } else if (raw.length >= 4) {
        gid = raw.toUpperCase().replace(/\s+/g, '');
      }

      if (!gid) {
        setErrorMsg('That does not look like a valid invite link or code.');
        return;
      }
      setSelectedGroupId(gid);
      setSelectedGroupName(gname || `Group ${gid}`);
      setStep(2);
    }
  };

  const handleJoinFinal = async () => {
    setErrorMsg('');
    const name = myName.trim();
    if (!name) {
      setErrorMsg('Please enter your name.');
      return;
    }

    setLoading(true);
    try {
      await joinGroup({
        gid: selectedGroupId,
        gname: selectedGroupName,
        name,
        avatar: myAvatar
      });
    } catch (err) {
      console.error('Join error:', err);
      setErrorMsg(`Connection failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="onboarding"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          radial-gradient(1200px 700px at 15% 10%, rgba(124,92,255,.14), transparent 60%),
          radial-gradient(1000px 700px at 90% 90%, rgba(0,229,255,.10), transparent 55%),
          var(--bg)
        `,
        padding: '24px',
        paddingTop: 'calc(24px + var(--sat))',
        paddingBottom: 'calc(24px + var(--sab))',
        paddingLeft: 'calc(24px + var(--sal))',
        paddingRight: 'calc(24px + var(--sar))',
        overflowY: 'auto'
      }}
    >
      {/* Background Grid */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          opacity: 0.35,
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(140,160,200,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(140,160,200,.06) 1px, transparent 1px)
          `,
          backgroundSize: '42px 42px',
          maskImage: 'radial-gradient(circle at 50% 40%, black, transparent 75%)'
        }}
      />

      <div
        className="glass"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '460px',
          margin: 'auto',
          borderRadius: '24px',
          padding: '36px 32px 28px',
          animation: 'cardIn .5s cubic-bezier(.2,.9,.25,1)'
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '26px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '11px',
              position: 'relative',
              flex: 'none',
              background: 'conic-gradient(from 220deg, var(--cyan), var(--violet), var(--cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(0,229,255,.35)'
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '3px',
                borderRadius: '8px',
                background: 'var(--bg-2)'
              }}
            />
            <span
              style={{
                position: 'relative',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--cyan)',
                boxShadow: '0 0 10px var(--cyan)'
              }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '20px', letterSpacing: '.5px' }}>
              ORBIT<em style={{ fontStyle: 'normal', color: 'var(--cyan)' }}>·</em>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '.6px',
                marginTop: '1px'
              }}
            >
              LIVE GROUP TRACKING
            </div>
          </div>
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '22px' }}>
          <i
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '3px',
              background: step >= 1 ? 'linear-gradient(90deg,var(--cyan),var(--violet))' : 'var(--border-soft)',
              transition: '.3s'
            }}
          />
          <i
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '3px',
              background: step >= 2 ? 'linear-gradient(90deg,var(--cyan),var(--violet))' : 'var(--border-soft)',
              transition: '.3s'
            }}
          />
        </div>

        {/* STEP 1: Connection */}
        {step === 1 && (
          <div>
            {inviteBanner && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '11px',
                  background: 'rgba(62,230,168,.08)',
                  border: '1px solid rgba(62,230,168,.25)',
                  marginBottom: '18px',
                  fontSize: '12px'
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: 'var(--success)',
                    boxShadow: '0 0 8px var(--success)',
                    flex: 'none'
                  }}
                />
                <div>
                  You're joining{' '}
                  <b style={{ color: 'var(--text)' }}>
                    {inviteBanner.n || inviteBanner.g}
                  </b>{' '}
                  via invite link
                </div>
              </div>
            )}

            {!inviteBanner && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '22px',
                  background: 'rgba(255,255,255,.03)',
                  padding: '4px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-soft)'
                }}
              >
                <div
                  onClick={() => setActiveTab('create')}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    textAlign: 'center',
                    borderRadius: '9px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: '.2s',
                    background:
                      activeTab === 'create'
                        ? 'linear-gradient(135deg, rgba(0,229,255,.15), rgba(124,92,255,.15))'
                        : 'transparent',
                    color: activeTab === 'create' ? 'var(--text)' : 'var(--muted)',
                    boxShadow:
                      activeTab === 'create' ? 'inset 0 0 0 1px rgba(0,229,255,.25)' : 'none'
                  }}
                >
                  Create Group
                </div>
                <div
                  onClick={() => setActiveTab('join')}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    textAlign: 'center',
                    borderRadius: '9px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: '.2s',
                    background:
                      activeTab === 'join'
                        ? 'linear-gradient(135deg, rgba(0,229,255,.15), rgba(124,92,255,.15))'
                        : 'transparent',
                    color: activeTab === 'join' ? 'var(--text)' : 'var(--muted)',
                    boxShadow:
                      activeTab === 'join' ? 'inset 0 0 0 1px rgba(0,229,255,.25)' : 'none'
                  }}
                >
                  Join Group
                </div>
              </div>
            )}

            {activeTab === 'create' && !inviteBanner && (
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: 'var(--muted)',
                    marginBottom: '6px',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '.4px',
                    textTransform: 'uppercase'
                  }}
                >
                  Group name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekend Trek Squad"
                  maxLength={40}
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,.035)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    padding: '11px 13px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontFamily: "'JetBrains Mono', monospace",
                    outline: 'none',
                    transition: '.2s'
                  }}
                />
                <div style={{ fontSize: '10.5px', color: 'var(--muted-2)', marginTop: '5px' }}>
                  A random 6-character group code will be generated for you to share after this.
                </div>
              </div>
            )}

            {activeTab === 'join' && !inviteBanner && (
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: 'var(--muted)',
                    marginBottom: '6px',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '.4px',
                    textTransform: 'uppercase'
                  }}
                >
                  Invite link or group code
                </label>
                <input
                  type="text"
                  placeholder="Paste invite link or enter 6-character code"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,.035)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    padding: '11px 13px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontFamily: "'JetBrains Mono', monospace",
                    outline: 'none',
                    transition: '.2s'
                  }}
                />
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--danger)',
                  background: 'rgba(255,77,109,.09)',
                  border: '1px solid rgba(255,77,109,.25)',
                  padding: '9px 11px',
                  borderRadius: '9px',
                  marginBottom: '12px',
                  animation: 'fadeDown .25s ease'
                }}
              >
                {errorMsg}
              </div>
            )}

            <button className="btn-primary" onClick={handleStep1Next} disabled={loading}>
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  Continue <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: Profile */}
        {step === 2 && (
          <div>
            <AvatarUpload
              name={myName}
              avatar={myAvatar}
              onAvatarChange={avatarUrl => setMyAvatar(avatarUrl)}
            />

            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  color: 'var(--muted)',
                  marginBottom: '6px',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '.4px',
                  textTransform: 'uppercase'
                }}
              >
                Your name
              </label>
              <input
                type="text"
                placeholder="How others will see you"
                maxLength={24}
                value={myName}
                onChange={e => setMyName(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,.035)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '11px 13px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: 'none',
                  transition: '.2s'
                }}
              />
            </div>

            <div
              style={{
                fontSize: '10.5px',
                color: 'var(--muted-2)',
                marginBottom: '14px',
                lineHeight: 1.5
              }}
            >
              📍 We'll ask for location access next — this powers live tracking on the map. Nothing
              is shared outside your group's database.
            </div>

            {errorMsg && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--danger)',
                  background: 'rgba(255,77,109,.09)',
                  border: '1px solid rgba(255,77,109,.25)',
                  padding: '9px 11px',
                  borderRadius: '9px',
                  marginBottom: '12px',
                  animation: 'fadeDown .25s ease'
                }}
              >
                {errorMsg}
              </div>
            )}

            <button className="btn-primary" onClick={handleJoinFinal} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Join & Start Sharing 🚀'}
            </button>
            <button className="btn-ghost" onClick={() => setStep(1)} disabled={loading}>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
