/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
  throw new Error("Missing environment variable: GOOGLE_SERVICE_ACCOUNT");
}

const admin = require('firebase-admin');
// const serviceAccount = require('../../secret/googleServiceAccount.json');
const serviceAccount = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT, 'base64').toString('utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();
const db = admin.firestore();

export { admin, db, bucket };