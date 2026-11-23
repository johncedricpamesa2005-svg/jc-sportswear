import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCEX7DpvlnU_XWPBk7FH66CWoukdBvlL7g",
  authDomain: "jc-sportswear.firebaseapp.com",
  projectId: "jc-sportswear",
  storageBucket: "jc-sportswear.firebasestorage.app",
  messagingSenderId: "62880724473",
  appId: "1:62880724473:web:b0058c4c22d83157e0f928",
  measurementId: "G-SZS2PTCV7N"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

const OWNER_EMAILS = [
  'admin@jcsportswear.com',
  'mysteryprince123@gmail.com',
  'johncedricpamesa2005@gmail.com'
];

// Pure user interaction: The owner manages/changes roles directly in Firestore!
export async function syncUserWithFirestore(firebaseUser) {
  try {
    const userRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userRef);
    const email = firebaseUser.email?.toLowerCase()?.trim() || "";

    let role = "user";

    if (!snap.exists()) {
      // New user: default to 'user' unless known owner
      role = OWNER_EMAILS.includes(email) ? "admin" : "user";

      const newUserData = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0] || "User",
        email: email,
        photoURL: firebaseUser.photoURL || "",
        role: role,
        provider: "google",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };
      await setDoc(userRef, newUserData);
    } else {
      // Existing user: preserve whatever role is stored in Firestore (owner changed it)
      const current = snap.data();
      role = current.role || (OWNER_EMAILS.includes(email) ? "admin" : "user");

      await updateDoc(userRef, {
        name: firebaseUser.displayName || current.name || "User",
        photoURL: firebaseUser.photoURL || current.photoURL || "",
        email: email || current.email,
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    return {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || email.split('@')[0] || "User",
      email: email,
      photo: firebaseUser.photoURL || "",
      photoURL: firebaseUser.photoURL || "",
      role: role,
      provider: "google"
    };
  } catch (error) {
    console.warn("Client Firestore sync warning:", error);
    const email = firebaseUser.email?.toLowerCase()?.trim() || "";
    return {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || email.split('@')[0] || "User",
      email: email,
      photo: firebaseUser.photoURL || "",
      photoURL: firebaseUser.photoURL || "",
      role: OWNER_EMAILS.includes(email) ? "admin" : "user",
      provider: "google"
    };
  }
}

// Helper to switch or choose role in Firestore directly
export async function setRoleInFirestore(uid, newRole) {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.warn("Direct Firestore role update warning:", err);
    return false;
  }
}
