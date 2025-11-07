import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCSoLhWifG3Xz_PIYsQtzqRIA0EOx2RWF8",
  authDomain: "yolohago-pe.firebaseapp.com",
  projectId: "yolohago-pe",
  storageBucket: "yolohago-pe.firebasestorage.app",
  messagingSenderId: "478270972847",
  appId: "1:478270972847:web:d0785d900d801856af855a",
  measurementId: "G-XB2J6G0VWG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
