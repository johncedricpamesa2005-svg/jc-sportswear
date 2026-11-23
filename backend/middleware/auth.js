import { getAuth as getFirebaseAdminAuth } from 'firebase-admin/auth';

const OWNER_ADMIN_EMAILS = [
  'admin@jcsportswear.com',
  'mysteryprince123@gmail.com',
  'johncedricpamesa2005@gmail.com'
];

export function createAuthMiddleware({ getFirestoreDb, isFirebaseReady }) {
  const verifyFirebaseToken = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Missing Bearer token.' });
      }

      const idToken = authHeader.slice(7).trim();
      if (!idToken) {
        return res.status(401).json({ message: 'Unauthorized: Empty token.' });
      }

      if (!isFirebaseReady()) {
        return res.status(503).json({ message: 'Firebase Admin is not configured on the server.' });
      }

      const decoded = await getFirebaseAdminAuth().verifyIdToken(idToken);
      const email = decoded.email?.toLowerCase()?.trim() || '';
      let role = OWNER_ADMIN_EMAILS.includes(email) ? 'admin' : 'user';

      const firestoreDb = getFirestoreDb();
      if (firestoreDb) {
        const userDoc = await firestoreDb.collection('users').doc(decoded.uid).get();
        if (userDoc.exists) {
          role = userDoc.data().role || role;
        }
      }

      req.user = {
        uid: decoded.uid,
        email,
        name: decoded.name || email.split('@')[0] || 'User',
        picture: decoded.picture || '',
        role
      };

      return next();
    } catch (error) {
      console.error('[AUTH MIDDLEWARE ERROR]', error.message);
      return res.status(401).json({ message: 'Unauthorized: Invalid or expired Firebase ID token.' });
    }
  };

  const requireAdmin = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Authentication required.' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Administrator privileges required.' });
    }
    return next();
  };

  return { verifyFirebaseToken, requireAdmin };
}
