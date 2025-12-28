import admin from "firebase-admin";

let app;

export function getFirebase() {
  if (app) return admin;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON env var.");

  const serviceAccount = JSON.parse(raw);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  app = admin.app();
  return admin;
}

export function db() {
  return getFirebase().firestore();
}
