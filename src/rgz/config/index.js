export const RGZ = {
  catalog: {
    latestPath: process.env.CATALOG_LATEST_PATH || "catalog/latest.json",
    versionsPrefix: process.env.CATALOG_VERSIONS_PREFIX || "catalog/versions/v",
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  },
  admin: {
    key: process.env.ADMIN_KEY || "",
  },
};
