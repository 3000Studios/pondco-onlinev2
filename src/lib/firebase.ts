import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2VCBOszos800f-m8inp7XhJkLH4FKkKs",
  authDomain: "gen-lang-client-0914367944.firebaseapp.com",
  projectId: "gen-lang-client-0914367944",
  storageBucket: "gen-lang-client-0914367944.firebasestorage.app",
  messagingSenderId: "76706851259",
  appId: "1:76706851259:web:2904f9ea088e7026d93c9e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
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
