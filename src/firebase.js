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
// Always prompt the Google account chooser so the user can pick any account
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
export const db = getFirestore(app);

// Strictly follows the role stored in Firestore ('admin' or 'user').
// New accounts default to 'user' until updated in Firestore.
export async function syncUserWithFirestore(firebaseUser) {
  const email = firebaseUser.email?.toLowerCase()?.trim() || "";
  const fallbackName = firebaseUser.displayName || email.split('@')[0] || "User";

  try {
    const userRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userRef);

    let role = "user";

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        name: fallbackName,
        email,
        photoURL: firebaseUser.photoURL || "",
        role: "user",
        provider: "google",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      role = "user";
    } else {
      const current = snap.data();
      role = current.role === "admin" ? "admin" : "user";

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
      name: fallbackName,
      email,
      photo: firebaseUser.photoURL || "",
      photoURL: firebaseUser.photoURL || "",
      role,
      provider: "google"
    };
  } catch (error) {
    console.warn("Client Firestore sync warning:", error);
    return {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      name: fallbackName,
      email,
      photo: firebaseUser.photoURL || "",
      photoURL: firebaseUser.photoURL || "",
      role: "user",
      provider: "google"
    };
  }
}
