import { db } from "../config/firebase";
import { INotification } from "../models/notification.model";
import { logger } from "../utils/logger";

export const createNotificationToken = async (notification: INotification): Promise<void> => {
  try {
    await db.collection('Notification').doc(notification.id).set(notification);
    logger.info(`Notification created = ${notification.id} - ${notification.token}`);
  } catch (error) {
    logger.error(`ERR: addSimilarReport() = ${error}`)
    throw error;
  }
}

export const getAllCustodianFcmTokens = async (campusId: string): Promise<string[]> => {
  try {
    const personSnap = await db.collection('Person')
      .where('campusId', '==', campusId)
      .where('isDeleted', '==', false)
      .get();

    const personIds = personSnap.docs
      .filter((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
        const data = doc.data();
        const roles = data.role;
        return Array.isArray(roles) &&
          roles.some((r) => r.roleId === "yPeHOYORTebVl9evpcET");
      })
      .map((doc: FirebaseFirestore.QueryDocumentSnapshot) => doc.id);

    if (personIds.length === 0) {
      logger.warn('No person with the target custodian role found.');
      return [];
    }

    const tokenPromises = personIds.map(async (personId: string) => {
      const snap = await db.collection('Notification')
        .where('personId', '==', personId)
        .where('campusId', '==', campusId)
        .get();

      return snap.docs
        .map((doc: FirebaseFirestore.QueryDocumentSnapshot) => doc.data().token as string)
        .filter(Boolean);
    });

    const tokenArrays = await Promise.all(tokenPromises);

    const allTokens = tokenArrays.flat();

    return allTokens;
  } catch (error) {
    logger.error(`ERR: getAllCustodianFcmTokens() = ${error}`)
    throw error;
  }
}