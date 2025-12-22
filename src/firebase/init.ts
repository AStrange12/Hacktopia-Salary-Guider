'use client';

import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function initializeFirebase(config: FirebaseOptions): FirebaseServices {
  if (getApps().length) {
    const app = getApp();
    return {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
  }

  // Ensure all required fields are present before initializing
  if (!config.apiKey || !config.authDomain || !config.projectId) {
     throw new Error("Firebase configuration is missing required fields (apiKey, authDomain, projectId). Check your environment variables.");
  }

  const app = initializeApp(config);
  
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
