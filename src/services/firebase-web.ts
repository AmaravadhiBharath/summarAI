import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCub0XtA27wJfA8QzLWTRcVvsn4Wiz84H0",
    authDomain: "tiger-superextension-09.firebaseapp.com",
    projectId: "tiger-superextension-09",
    storageBucket: "tiger-superextension-09.firebasestorage.app",
    messagingSenderId: "523127017746",
    appId: "1:523127017746:web:c58418b3ad5009509823cb",
    measurementId: "G-53CSV68T7D"
};

// Initialize Firebase (Singleton)
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- AUTH (WEB STANDARD) ---
export const signInWithGoogleWeb = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error: any) {
        console.error("Web Login Error:", error);
        alert("Login Failed: " + error.message);
        throw error;
    }
};

export const logoutWeb = async () => {
    await signOut(auth);
};

export const subscribeToAuthChangesWeb = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// --- FIRESTORE (READ ONLY FOR MOBILE) ---
export const getHistoryFromFirestoreWeb = async (userId: string) => {
    try {
        const historyRef = collection(db, 'users', userId, 'history');
        const q = query(historyRef, orderBy('date', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
};
