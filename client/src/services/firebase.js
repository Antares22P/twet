import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  remove,
  onValue,
  onDisconnect,
  get,
  child
} from 'firebase/database';
import { FIREBASE_CONFIG } from '../constants/config';

let appInstance = null;
let dbInstance = null;

export function getFirebaseDb() {
  if (!dbInstance) {
    appInstance = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
    dbInstance = getDatabase(appInstance);
  }
  return dbInstance;
}

export function subscribeToMembers(groupId, callback) {
  const db = getFirebaseDb();
  const membersRef = ref(db, `groups/${groupId}/members`);
  const unsubscribe = onValue(membersRef, snapshot => {
    const data = snapshot.val() || {};
    callback(data);
  });
  return () => unsubscribe();
}

export function subscribeToDestinations(groupId, callback) {
  const db = getFirebaseDb();
  const destRef = ref(db, `groups/${groupId}/destinations`);
  const unsubscribe = onValue(destRef, snapshot => {
    const data = snapshot.val() || {};
    callback(data);
  });
  return () => unsubscribe();
}

export async function ensureGroupMeta(groupId, groupName) {
  const db = getFirebaseDb();
  const metaRef = ref(db, `groups/${groupId}/meta`);
  const snap = await get(metaRef);
  if (!snap.exists()) {
    const meta = { name: groupName || `Group ${groupId}`, createdAt: Date.now() };
    await set(metaRef, meta);
    return meta;
  }
  return snap.val();
}

export function pushMemberLocation(groupId, memberId, locationData) {
  const db = getFirebaseDb();
  const memberRef = ref(db, `groups/${groupId}/members/${memberId}`);
  return set(memberRef, locationData);
}

export function setupDisconnectHooks(groupId, memberId) {
  const db = getFirebaseDb();
  const memberRef = ref(db, `groups/${groupId}/members/${memberId}`);
  const destRef = ref(db, `groups/${groupId}/destinations/${memberId}`);
  onDisconnect(memberRef).remove();
  onDisconnect(destRef).remove();
}

export function setDestination(groupId, memberId, lat, lng) {
  const db = getFirebaseDb();
  const destRef = ref(db, `groups/${groupId}/destinations/${memberId}`);
  return set(destRef, { lat, lng, setAt: Date.now() });
}

export function clearDestination(groupId, memberId) {
  const db = getFirebaseDb();
  const destRef = ref(db, `groups/${groupId}/destinations/${memberId}`);
  return remove(destRef);
}

export function removeMemberFromGroup(groupId, memberId) {
  const db = getFirebaseDb();
  const memberRef = ref(db, `groups/${groupId}/members/${memberId}`);
  const destRef = ref(db, `groups/${groupId}/destinations/${memberId}`);
  return Promise.all([remove(memberRef), remove(destRef)]);
}
