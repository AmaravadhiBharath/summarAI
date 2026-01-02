import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, query, orderBy, limit, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCub0XtA27wJfA8QzLWTRcVvsn4Wiz84H0",
    authDomain: "tiger-superextension-09.firebaseapp.com",
    projectId: "tiger-superextension-09",
    storageBucket: "tiger-superextension-09.firebasestorage.app",
    messagingSenderId: "523127017746",
    appId: "1:523127017746:web:c58418b3ad5009509823cb",
    measurementId: "G-53CSV68T7D"
};

const app = initializeApp(firebaseConfig, 'extension-app');
const db = getFirestore(app);

// NO FIREBASE AUTH - Extension uses chrome.identity instead
// This file is ONLY for Firestore operations

export const saveHistoryToFirestore = async (userId: string, summary: string, url: string) => {
    try {
        const historyRef = doc(collection(db, `users/${userId}/history`));
        await setDoc(historyRef, {
            summary,
            url,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error saving history to Firestore", error);
    }
};

export const getHistoryFromFirestore = async (userId: string) => {
    try {
        const historyRef = collection(db, `users/${userId}/history`);
        const q = query(historyRef, orderBy('timestamp', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching history from Firestore", error);
        return [];
    }
};

export const clearHistoryFromFirestore = async (userId: string) => {
    try {
        const historyRef = collection(db, `users/${userId}/history`);
        const snapshot = await getDocs(historyRef);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
    } catch (error) {
        console.error("Error clearing history from Firestore", error);
        throw error;
    }
};

export const saveUserProfile = async (user: { id: string; email: string; name: string; picture: string }) => {
    try {
        const userRef = doc(db, 'users', user.id);
        await setDoc(userRef, {
            email: user.email,
            name: user.name,
            picture: user.picture,
            lastLogin: new Date().toISOString()
        }, { merge: true });
    } catch (error) {
        console.error("Error saving user profile", error);
        throw error;
    }
};
