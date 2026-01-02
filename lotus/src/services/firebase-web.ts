import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getDatabase, ref, get } from 'firebase/database';

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
export const realtimeDb = getDatabase(app);

// --- AUTH (WEB STANDARD) ---
export const signInWithGoogleWeb = async () => {
    try {
        const provider = new GoogleAuthProvider();
        // Use redirect for better mobile support
        await signInWithRedirect(auth, provider);
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

// --- FIRESTORE (REAL-TIME) ---
export const subscribeToHistoryWeb = (userId: string, callback: (data: any[]) => void) => {
    try {
        const historyRef = collection(db, 'users', userId, 'history');
        const q = query(historyRef, orderBy('timestamp', 'desc'), limit(50));

        return onSnapshot(q, (snapshot: any) => {
            const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            callback(data);
        }, (error: any) => {
            console.error("Error subscribing to history:", error);
            callback([]);
        });
    } catch (error) {
        console.error("Error setting up subscription:", error);
        return () => { }; // Return empty unsubscribe function
    }
};

// --- FIRESTORE (READ ONLY FOR MOBILE) ---
export const getHistoryFromFirestoreWeb = async (userId: string) => {
    try {
        const historyRef = collection(db, 'users', userId, 'history');
        const q = query(historyRef, orderBy('timestamp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
};

// --- REALTIME DB (PRO STATUS) ---
export const checkUserProStatusWeb = async (email: string): Promise<boolean> => {
    try {
        const userKey = email.replace(/\./g, '_');
        const userRef = ref(realtimeDb, `admin/users/${userKey}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        return userData?.isPro || false;
    } catch (error) {
        console.error("Error checking user pro status", error);
        return false;
    }
};
