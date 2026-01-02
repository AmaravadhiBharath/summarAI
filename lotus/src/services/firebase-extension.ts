import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { getDatabase, ref, get, onValue } from 'firebase/database';

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
const realtimeDb = getDatabase(app);

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

// ============ ADMIN CONTROLS ============

export interface AdminFeatures {
    imageAnalysis: boolean;
    creativeTone: boolean;
    professionalTone: boolean;
    jsonFormat: boolean;
    xmlFormat: boolean;
}

export interface AdminQuotas {
    guest: number;
    free: number;
    pro: number;
}

export const getAdminFeatures = async (): Promise<AdminFeatures> => {
    try {
        const featuresRef = ref(realtimeDb, 'admin/features');
        const snapshot = await get(featuresRef);
        return snapshot.val() || {
            imageAnalysis: true,
            creativeTone: true,
            professionalTone: true,
            jsonFormat: true,
            xmlFormat: true
        };
    } catch (error) {
        console.error("Error fetching admin features", error);
        return {
            imageAnalysis: true,
            creativeTone: true,
            professionalTone: true,
            jsonFormat: true,
            xmlFormat: true
        };
    }
};

export const getAdminQuotas = async (): Promise<AdminQuotas> => {
    try {
        const quotasRef = ref(realtimeDb, 'admin/quotas');
        const snapshot = await get(quotasRef);
        return snapshot.val() || { guest: 3, free: 14, pro: 100 };
    } catch (error) {
        console.error("Error fetching admin quotas", error);
        return { guest: 3, free: 14, pro: 100 };
    }
};

export const checkUserProStatus = async (email: string): Promise<boolean> => {
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

export const subscribeToAdminFeatures = (callback: (features: AdminFeatures) => void) => {
    const featuresRef = ref(realtimeDb, 'admin/features');
    return onValue(featuresRef, (snapshot) => {
        const features = snapshot.val() || {
            imageAnalysis: true,
            creativeTone: true,
            professionalTone: true,
            jsonFormat: true,
            xmlFormat: true
        };
        callback(features);
    });
};

// ============ WELCOME EMAIL ============

const BACKEND_URL = "https://tai-backend.amaravadhibharath.workers.dev";

export const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
    try {
        const response = await fetch(`${BACKEND_URL}/send-welcome-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name })
        });

        if (!response.ok) {
            throw new Error('Failed to send welcome email');
        }

        return true;
    } catch (error) {
        console.error("Error sending welcome email:", error);
        return false;
    }
};

export const checkAndSendWelcomeEmail = async (user: { id: string; email: string; name: string }) => {
    try {
        // Check if we've already sent a welcome email to this user
        const result = await chrome.storage.local.get([`welcomeEmailSent_${user.id}`]);

        if (result[`welcomeEmailSent_${user.id}`]) {
            console.log("Welcome email already sent to this user");
            return;
        }

        // Send welcome email
        const success = await sendWelcomeEmail(user.email, user.name);

        if (success) {
            // Mark as sent
            await chrome.storage.local.set({ [`welcomeEmailSent_${user.id}`]: true });
            console.log("Welcome email sent successfully!");
        }
    } catch (error) {
        console.error("Error in checkAndSendWelcomeEmail:", error);
    }
};
