import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential, signOut, onAuthStateChanged, type User } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCub0XtA27wJfA8QzLWTRcVvsn4Wiz84H0",
    authDomain: "tiger-superextension-09.firebaseapp.com",
    projectId: "tiger-superextension-09",
    storageBucket: "tiger-superextension-09.firebasestorage.app",
    messagingSenderId: "523127017746",
    appId: "1:523127017746:web:c58418b3ad5009509823cb",
    measurementId: "G-53CSV68T7D"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const signInWithGoogle = async () => {
    const getToken = (interactive: boolean) => {
        return new Promise<string>((resolve, reject) => {
            let completed = false;

            // Timeout after 10s
            const timer = setTimeout(() => {
                if (!completed) {
                    completed = true;
                    reject("Token request timed out. Please try again.");
                }
            }, 10000);

            chrome.identity.getAuthToken({ interactive }, (token) => {
                if (completed) return;
                completed = true;
                clearTimeout(timer);

                if (chrome.runtime.lastError || !token) {
                    reject(chrome.runtime.lastError?.message || 'No token found');
                } else {
                    resolve(token as string);
                }
            });
        });
    };

    try {
        // DEBUG: Start
        // alert("Starting Sign In...");

        // 1. Get Token
        let token = await getToken(true);
        // alert("Got Chrome Token");

        // 2. Try Firebase Sign-in
        try {
            const credential = GoogleAuthProvider.credential(null, token);
            const result = await signInWithCredential(auth, credential);
            return result.user;
        } catch (firebaseError: any) {
            // If Firebase rejects it (e.g. auth/invalid-credential), the token might be stale.
            console.warn("Firebase rejected token, clearing cache and retrying...", firebaseError);
            // alert("Firebase rejected token, retrying...");

            // 3. Remove cached token
            await new Promise<void>((resolve) => {
                chrome.identity.removeCachedAuthToken({ token }, () => resolve());
            });

            // 4. Retry Get Token (Force fresh)
            token = await getToken(true);
            const credential = GoogleAuthProvider.credential(null, token);
            const result = await signInWithCredential(auth, credential);
            return result.user;
        }

    } catch (error: any) {
        console.error("Error signing in with Google", error);
        alert("Sign In Error: " + (error.message || error));
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};

export const clearChromeIdentityToken = async () => {
    try {
        // 1. Get current token (non-interactive)
        const token = await new Promise<string>((resolve) => {
            chrome.identity.getAuthToken({ interactive: false }, (token) => {
                resolve((token as string) || '');
            });
        });

        if (token) {
            // 2. Revoke token via Google API (Forces re-consent/login)
            await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);

            // 3. Remove from cache
            await new Promise<void>((resolve) => {
                chrome.identity.removeCachedAuthToken({ token }, () => resolve());
            });
        }

        // 4. Sign out from Firebase
        await signOut(auth);
    } catch (e) {
        console.error("Error clearing token", e);
    }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// --- FIRESTORE (History Sync) ---
import { getFirestore, collection, doc, setDoc, getDocs, query, orderBy, limit, deleteDoc } from 'firebase/firestore';

export const db = getFirestore(app);

export const saveHistoryToFirestore = async (userId: string, item: any) => {
    try {
        // Use a subcollection 'history' for each user
        const historyRef = doc(db, 'users', userId, 'history', String(item.id));
        await setDoc(historyRef, item);
    } catch (error) {
        console.error("Error saving history to Firestore", error);
    }
};

export const getHistoryFromFirestore = async (userId: string) => {
    try {
        const historyRef = collection(db, 'users', userId, 'history');
        const q = query(historyRef, orderBy('date', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Error fetching history from Firestore", error);
        return [];
    }
};

export const clearHistoryFromFirestore = async (userId: string) => {
    try {
        const historyRef = collection(db, 'users', userId, 'history');
        const q = query(historyRef);
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
    } catch (error) {
        console.error("Error clearing history from Firestore", error);
    }
};

export const saveUserProfile = async (user: User) => {
    try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLogin: new Date().toISOString()
        }, { merge: true }); // Merge to update lastLogin without overwriting other fields
    } catch (error) {
        console.error("Error saving user profile", error);
    }
};
