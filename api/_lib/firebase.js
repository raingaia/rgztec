import admin from "firebase-admin";

if (!admin.apps.length) {
  // En pratik yöntem: GOOGLE_APPLICATION_CREDENTIALS ya da service account json
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export const db = admin.firestore();
