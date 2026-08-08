const GUEST_ID_KEY = 'chicknchunks_guest_id';

export function getGuestId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_ID_KEY);
}

export function setGuestId(id) {
  if (typeof window !== 'undefined' && id) {
    localStorage.setItem(GUEST_ID_KEY, id);
  }
}

export function generateGuestUuid() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return 'guest_' + window.crypto.randomUUID();
  }
  return 'guest_' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
}

export function getOrCreateGuestId() {
  let existing = getGuestId();
  if (!existing) {
    existing = generateGuestUuid();
    setGuestId(existing);
  }
  return existing;
}
