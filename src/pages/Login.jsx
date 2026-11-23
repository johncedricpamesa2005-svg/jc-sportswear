import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, syncUserWithFirestore } from '../firebase.js';
import { apiUrl } from '../api.js';

const A = '/assets/';

export default function Login({ onLogin, initialHookMessage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/home';

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const finalizeAuth = async firebaseUser => {
    const idToken = await firebaseUser.getIdToken();
    const firestoreUser = await syncUserWithFirestore(firebaseUser);

    try {
      const backendRes = await fetch(apiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        onLogin(backendData.user, redirectTo);
        return;
      }
    } catch (backErr) {
      console.warn('Backend auth sync fallback to Firestore:', backErr);
    }

    onLogin(firestoreUser, redirectTo);
  };

  // Email / Password via Firebase Auth (generates verified Firebase ID token)
  const submit = async e => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass || (mode === 'register' && !name.trim())) {
      setError('Please complete all required fields.');
      return;
    }

    if (pass.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (mode === 'register') {
        result = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        await updateProfile(result.user, { displayName: name.trim() });
      } else {
        result = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      }
      await finalizeAuth(result.user);
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        setError(err.message || 'Unable to authenticate.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In (OAuth 2.0)
  const googleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await finalizeAuth(result.user);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('Google sign-in was closed before completion.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized in Firebase Console. Add this domain under Authentication → Settings → Authorized domains.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups and try again.');
      } else {
        setError(err.message || 'Google sign-in encountered an error.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card shadow-lg">
        <img src={A + 'logo.png'} alt="JC Sportswear" />
        <h2 className="mt-2 mb-1 fw-bold">JC Sportswear</h2>
        <p className="text-muted small mb-3">
          {mode === 'login'
            ? 'Sign in to access exclusive member pricing and manage your orders.'
            : 'Create an account to start shopping tournament-grade sportswear.'}
        </p>

        {initialHookMessage && (
          <div className="alert alert-warning py-2 small text-start d-flex align-items-center gap-2 mb-3" role="alert">
            <i className="bi bi-info-circle-fill fs-5" />
            <div>{initialHookMessage}</div>
          </div>
        )}

        {error && <div className="alert alert-danger text-start py-2 small" role="alert">{error}</div>}

        <button
          type="button"
          className="btn btn-outline-dark w-100 mb-3 d-flex align-items-center justify-content-center gap-2 py-2"
          onClick={googleLogin}
          disabled={loading}
        >
          <i className="bi bi-google text-danger fs-5" />
          <span>Continue with Google</span>
        </button>

        <div className="d-flex align-items-center my-3 text-muted small">
          <hr className="flex-grow-1 my-0" />
          <span className="px-2">or continue with email</span>
          <hr className="flex-grow-1 my-0" />
        </div>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <input
              required
              type="text"
              className="form-control mb-3"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          )}

          <input
            required
            type="email"
            className="form-control mb-3"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            required
            type="password"
            className="form-control mb-3"
            placeholder="Password (min. 6 characters)"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />

          <button disabled={loading} className="btn btn-primary w-100 py-2 fw-bold">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 d-flex justify-content-between align-items-center pt-2 border-top">
          <button className="btn btn-link text-muted p-0 small text-decoration-none" onClick={() => navigate('/')}>
            ← Back to Browsing
          </button>

          <button
            className="btn btn-link p-0 small text-decoration-none fw-bold"
            onClick={() => {
              setError('');
              setMode(mode === 'login' ? 'register' : 'login');
            }}
          >
            {mode === 'login' ? "Need an account? Register" : 'Already registered? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
