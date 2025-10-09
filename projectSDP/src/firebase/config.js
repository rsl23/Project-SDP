// Firebase App Initialization
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCONECmExrEM1zwzO9dKaHHsTl79MV4Dr4",
  authDomain: "project-sdp-fpw.firebaseapp.com",
  projectId: "project-sdp-fpw",
  storageBucket: "project-sdp-fpw.firebasestorage.app",
  messagingSenderId: "248928609793",
  appId: "1:248928609793:web:4b62ede10751f92aed0200",
  measurementId: "G-45CBKGR3FK",
};

// Initialize Firebase (hanya sekali)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Export app jika diperlukan
export default app;
