import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIeVz2-UB5Uc2jxfrL6u7bde8JLFnaPjI",
  authDomain: "ozoox-8ccb1.firebaseapp.com",
  projectId: "ozoox-8ccb1",
  storageBucket: "ozoox-8ccb1.appspot.com",
  messagingSenderId: "542665470830",
  appId: "1:542665470830:web:3a42af0212243da44cc77f",
  measurementId: "G-0RLFT7ZVLP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app);
const firestore = getFirestore(app);
const db = getFirestore(app);

export { app, analytics, auth, storage, firestore,db };
