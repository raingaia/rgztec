import admin from "firebase-admin";
import { RGZ } from "../config/index.js";

let inited = false;

export function initFirebaseAdmin() {
  if (inited) return;

  const { projectId, clientEmail, privateKey, storageBucket } = RGZ.firebase;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin env vars (projectId/clientEmail/privateKey).");
  }

  // Vercel serverless can reuse process between invocations; guard init.
  if (!admin.apps?.length) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      storageBucket,
    });
  }

  inited = true;
}

export function db() {
  initFirebaseAdmin();
  return admin.firestore();
}

export function bucket() {
  initFirebaseAdmin();
  return admin.storage().bucket();
}

export const FieldValue = admin.firestore.FieldValue;
