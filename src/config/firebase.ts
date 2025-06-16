/* eslint-disable @typescript-eslint/no-require-imports */
const admin = require('firebase-admin');
const serviceAccount = require('../../secret/googleServiceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

export { admin, db };