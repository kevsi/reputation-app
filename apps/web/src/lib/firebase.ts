/**
 * Firebase configuration for Sentinelle Reputation App
 * Used for Google OAuth authentication
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyAxRpqKm-SuUD9xmMfnRkRakiaIzU_-sc4',
    authDomain: 'reputation-app-ef175.firebaseapp.com',
    projectId: 'reputation-app-ef175',
    storageBucket: 'reputation-app-ef175.firebasestorage.app',
    messagingSenderId: '442015139983',
    appId: '1:442015139983:web:8dcc4f4f0db0854d0ec8fa',
    measurementId: 'G-QTL0F71JK1'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google popup
 */
export async function signInWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
}

/**
 * Sign out from Firebase
 */
export async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
}

/**
 * Get the current Firebase user
 */
export function getCurrentUser(): User | null {
    return auth.currentUser;
}

/**
 * Get Google ID token for backend authentication
 */
export async function getGoogleIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
        return await user.getIdToken();
    } catch {
        return null;
    }
}

export { auth, googleProvider };
export default app;
