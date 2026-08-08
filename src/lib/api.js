const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('chicknchunksAuthToken');
}

export function setAuthToken(token) {
  if (typeof window !== 'undefined' && token) {
    localStorage.setItem('chicknchunksAuthToken', token);
  }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('chicknchunksAuthToken');
  }
}

export async function api(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const separator = path.includes('?') ? '&' : '?';
  const cacheBust = (!options.method || options.method === 'GET') && !isFormData ? `${separator}_=${Date.now()}` : '';
  const token = getAuthToken();
  const headers = {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    ...(options.headers || {})
  };
  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (typeof window !== 'undefined') {
    const guestId = localStorage.getItem('chicknchunks_guest_id');
    if (guestId) {
      headers['X-Guest-ID'] = guestId;
    }
  }

  // PHP doesn't populate $_FILES for PUT requests, so we spoof with POST + override header
  let method = options.method || 'GET';
  if (isFormData && (method === 'PUT' || method === 'PATCH')) {
    headers['X-HTTP-Method-Override'] = method;
    method = 'POST';
  }

  const response = await fetch(`${API_BASE_URL}${path}${cacheBust}`, {
    credentials: 'include',
    ...options,
    headers,
    method,
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);

  if (response.status === 401) {
    // Token is invalid or expired — clear it so subsequent requests
    // won't keep sending a stale credential.
    clearAuthToken();
    throw new Error(payload?.message || 'Unauthenticated');
  }

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload;
}
