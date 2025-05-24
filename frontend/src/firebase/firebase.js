import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCuljO8DGFHsVGN3tcuy9J9nkBrUXyKtRI",
  authDomain: "military-asset.firebaseapp.com",
  projectId: "military-asset",
  storageBucket: "military-asset.firebasestorage.app",
  messagingSenderId: "1059460937015",
  appId: "1:1059460937015:web:5593b8f58eaf75994616b2",
  measurementId: "G-4R2XJ15CK2",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
export { app };
