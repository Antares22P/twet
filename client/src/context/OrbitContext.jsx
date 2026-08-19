import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  subscribeToMembers,
  subscribeToDestinations,
  ensureGroupMeta,
  pushMemberLocation,
  setupDisconnectHooks,
  setDestination as firebaseSetDestination,
  clearDestination as firebaseClearDestination,
  removeMemberFromGroup
} from '../services/firebase';
import {
  genMemberId,
  colorFor,
  haversine,
  linkKey,
  vibrate,
  fmtDist
} from '../utils/geo';
import { getSavedSession, saveSession, clearSession } from '../utils/storage';
import { burstConfetti } from '../utils/confetti';
import {
  LINK_CONNECT_M,
  LINK_BREAK_M,
  ARRIVAL_RADIUS_M
} from '../constants/config';
import { useSound } from './SoundContext';
import { clearRoutesForDestination } from '../services/osrmService';

const OrbitContext = createContext();

export function OrbitProvider({ children }) {
  const { playChime } = useSound();

  // Session & Identity
  const [groupId, setGroupId] = useState(null);
  const [groupName, setGroupName] = useState(null);
  const [myId, setMyId] = useState(null);
  const [myName, setMyName] = useState(null);
  const [myAvatar, setMyAvatar] = useState(null);
  const [myColor, setMyColor] = useState(null);
  const [joined, setJoined] = useState(false);

  // Group Live Data
  const [members, setMembers] = useState({});
  const [destinations, setDestinations] = useState({});
  const [myPos, setMyPos] = useState(null);
  const [firstFix, setFirstFix] = useState(false);

  // Proximity & Links
  const [links, setLinks] = useState({});
  const [linkedMemberIds, setLinkedMemberIds] = useState(new Set());
  const linksSeededRef = useRef(false);
  const linksRef = useRef({});

  // UI & Map States
  const [mapStyle, setMapStyle] = useState('dark');
  const [linesVisible, setLinesVisible] = useState(true);
  const [followMe, setFollowMe] = useState(false);
  const [pickingDestination, setPickingDestination] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 720 : false
  );
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Arrival tracking
  const celebratedRef = useRef({});
  const watchIdRef = useRef(null);

  const addToast = (msg, type = '') => {
    const id = 'toast_' + Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  // Try auto restore on mount
  useEffect(() => {
    const saved = getSavedSession();
    if (saved) {
      setGroupId(saved.groupId);
      setGroupName(saved.groupName);
      setMyId(saved.myId);
      setMyName(saved.myName);
      setMyAvatar(saved.myAvatar);
      setMyColor(saved.myColor || colorFor(saved.myId));
      setJoined(true);
    }
  }, []);

  // Handle Proximity Links computation whenever members change
  useEffect(() => {
    const entries = Object.entries(members).filter(
      ([, m]) => m.lat != null && m.lng != null
    );
    const activeKeys = new Set();
    const newLinkedIds = new Set();
    const newLinks = { ...linksRef.current };

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [id1, m1] = entries[i];
        const [id2, m2] = entries[j];
        const key = linkKey(id1, id2);
        const dist = haversine(m1.lat, m1.lng, m2.lat, m2.lng);
        const prevLinked = newLinks[key] === true;
        let nowLinked = prevLinked;

        if (!prevLinked && dist <= LINK_CONNECT_M) nowLinked = true;
        else if (prevLinked && dist > LINK_BREAK_M) nowLinked = false;

        if (nowLinked) {
          activeKeys.add(key);
          newLinkedIds.add(id1);
          newLinkedIds.add(id2);
        }

        if (linksSeededRef.current && nowLinked !== prevLinked) {
          const n1 = m1.name || 'A member';
          const n2 = m2.name || 'A member';
          if (id1 === myId || id2 === myId) {
            const other = id1 === myId ? n2 : n1;
            if (nowLinked) {
              addToast(`🟢 Proximity link with ${other} — ${fmtDist(dist)} apart`, 'success');
              vibrate([35, 25, 35]);
            }
          } else if (!nowLinked) {
            addToast(`📡 ${n1} and ${n2} moved out of proximity range (${fmtDist(dist)})`, 'error');
            vibrate([260, 110, 260, 110, 260]);
          }
        }
        newLinks[key] = nowLinked;
      }
    }

    // Clean departed members
    Object.keys(newLinks).forEach(k => {
      const [a, b] = k.split('|');
      if (!members[a] || !members[b]) delete newLinks[k];
    });

    linksRef.current = newLinks;
    setLinks(newLinks);
    setLinkedMemberIds(newLinkedIds);
    linksSeededRef.current = true;
  }, [members, myId]);

  // Handle Destination arrival detection
  useEffect(() => {
    Object.entries(destinations).forEach(([destId, dest]) => {
      const member = members[destId];
      if (!dest || dest.lat == null || !member || member.lat == null) return;

      const straightDist = haversine(member.lat, member.lng, dest.lat, dest.lng);
      if (straightDist <= ARRIVAL_RADIUS_M && !celebratedRef.current[destId]) {
        celebratedRef.current[destId] = true;
        addToast(`🎉 ${member.name || 'A member'} arrived at their destination!`, 'success');
        burstConfetti();
        playChime([523, 659, 784]);

        if (destId === myId) {
          setTimeout(() => {
            clearMyDestination();
          }, 1800);
        }
      }
    });
  }, [members, destinations, myId]);

  // Subscribe to Firebase RTDB when joined
  useEffect(() => {
    if (!joined || !groupId || !myId) return;

    setupDisconnectHooks(groupId, myId);

    const unsubMembers = subscribeToMembers(groupId, remoteMembers => {
      setMembers(remoteMembers);
    });

    const unsubDest = subscribeToDestinations(groupId, remoteDest => {
      setDestinations(remoteDest);
    });

    // Start geolocation watcher
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        pos => {
          setMyPos(pos);
          setFirstFix(true);
          const locationData = {
            name: myName,
            avatar: myAvatar || null,
            color: myColor,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy || null,
            heading: pos.coords.heading || null,
            speed: pos.coords.speed || null,
            updatedAt: Date.now()
          };
          pushMemberLocation(groupId, myId, locationData).catch(err =>
            console.error('Push location error:', err)
          );
        },
        err => {
          console.warn('Geolocation error:', err);
          if (err.code === 1) {
            addToast('Location permission denied — enable it to share your position.', 'error');
          } else {
            addToast(`Could not get location: ${err.message}`, 'error');
          }
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
    } else {
      addToast('Geolocation not supported on this device.', 'error');
    }

    return () => {
      unsubMembers();
      unsubDest();
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [joined, groupId, myId, myName, myAvatar, myColor]);

  const joinGroup = async ({ gid, gname, name, avatar }) => {
    const memberId = genMemberId();
    const color = colorFor(memberId);

    await ensureGroupMeta(gid, gname);

    setGroupId(gid);
    setGroupName(gname);
    setMyId(memberId);
    setMyName(name);
    setMyAvatar(avatar);
    setMyColor(color);
    setJoined(true);

    saveSession({
      groupId: gid,
      groupName: gname,
      myId: memberId,
      myName: name,
      myAvatar: avatar,
      myColor: color
    });
  };

  const setMyDestination = (lat, lng) => {
    if (!groupId || !myId) return;
    delete celebratedRef.current[myId];
    clearRoutesForDestination(myId);
    firebaseSetDestination(groupId, myId, lat, lng);
    addToast('Destination set 🎯', 'success');
  };

  const clearMyDestination = () => {
    if (!groupId || !myId) return;
    delete celebratedRef.current[myId];
    clearRoutesForDestination(myId);
    firebaseClearDestination(groupId, myId);
  };

  const leaveGroup = async () => {
    if (!window.confirm('Leave this group and stop sharing your location?')) return;
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (groupId && myId) {
      await removeMemberFromGroup(groupId, myId);
    }
    clearSession();
    window.location.hash = '';
    window.location.reload();
  };

  return (
    <OrbitContext.Provider
      value={{
        groupId,
        groupName,
        myId,
        myName,
        myAvatar,
        myColor,
        joined,
        members,
        destinations,
        myPos,
        firstFix,
        links,
        linkedMemberIds,
        mapStyle,
        setMapStyle,
        linesVisible,
        setLinesVisible,
        followMe,
        setFollowMe,
        pickingDestination,
        setPickingDestination,
        sidebarCollapsed,
        setSidebarCollapsed,
        inviteModalOpen,
        setInviteModalOpen,
        toasts,
        addToast,
        joinGroup,
        setMyDestination,
        clearMyDestination,
        leaveGroup
      }}
    >
      {children}
    </OrbitContext.Provider>
  );
}

export function useOrbit() {
  return useContext(OrbitContext);
}
