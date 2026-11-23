import { auth } from './firebase.js';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiUrl = path => `${API_BASE}${path}`;

/**
 * Authenticated fetch wrapper that attaches the Firebase ID Token
 * in the `Authorization: Bearer <token>` header for protected Express endpoints.
 */
export async function authFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    } catch (err) {
      console.warn('Could not retrieve Firebase ID token:', err);
    }
  }

  return fetch(apiUrl(path), {
    ...options,
    headers
  });
}
