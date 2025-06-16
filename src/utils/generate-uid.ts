import admin from 'firebase-admin';

export function generateUID(): string {
  return admin.firestore().collection('_').doc().id;
}