import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2VCBOszos800f-m8inp7XhJkLH4KFkKs",
  authDomain: "gen-lang-client-0914367944.firebaseapp.com",
  projectId: "gen-lang-client-0914367944",
  storageBucket: "gen-lang-client-0914367944.firebasestorage.app",
  messagingSenderId: "76706851259",
  appId: "1:76706851259:web:bc534d20b8152cd7d93c9e",
  measurementId: "G-DH1WBK8YWK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // User signed in successfully
    console.log("User logged in:", result.user);
    return result.user;
  } catch (error: any) {
    console.error("Google Auth Error:", error.message);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", result.user);
    return result.user;
  } catch (error: any) {
    console.error("Email Auth Error:", error.message);
    throw error;
  }
};
