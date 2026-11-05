// UniLend v2: Firebase Configuration & SDK Initialization
// Pinned Firebase JS SDK v10.12.0 via CDN

export const firebaseConfig = {
  projectId: "unilend-campus-dev",
  appId: "1:697923725047:web:4b42b337dac23fd474d5f2",
  storageBucket: "unilend-campus-dev.firebasestorage.app",
  apiKey: "AIzaSyD-5iLfs654AbmiTeZmQ9A4rW5foTien9c",
  authDomain: "unilend-campus-dev.firebaseapp.com",
  messagingSenderId: "697923725047",
  projectNumber: "697923725047"
};

// Check if running in emulator mode or fallback mock mode
export const isEmulator = location.hostname === "localhost" && location.port === "5000";

