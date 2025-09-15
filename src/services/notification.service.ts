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
    logger.info(`Starting getAllCustodianFcmTokens for campusId: ${campusId}`);

    const personSnap = await db.collection('Person')
      .where('campusId', '==', campusId)
      .where('isDeleted', '==', false)
      .get();

    logger.info(`[Step 1] 'Person' query successful. Found ${personSnap.docs.length} documents.`);

    const personIds = personSnap.docs
      .filter((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
        const data = doc.data();
        const roles = data.role;
        return Array.isArray(roles) &&
          roles.some((r) => r.roleId === "yPeHOYORTebVl9evpcET");
      })
      .map((doc: FirebaseFirestore.QueryDocumentSnapshot) => doc.id);

    logger.info(`[Step 2] 'Person' filter successful. Found ${personIds.length} person with the 'Custodian' role.`);

    if (personIds.length === 0) {
      logger.warn('No person with the target custodian role found. Returning an empty array.');
      return [];
    }

    const tokenPromises = personIds.map(async (personId: string) => {
      logger.info(`[Step 3] Searching for notification token for personId: ${personId}`);
      const snap = await db.collection('Notification')
        .where('personId', '==', personId)
        .where('campusId', '==', campusId)
        .get();

      logger.info(`[Step 4] 'Notification' query for personId ${personId} successful. Found ${snap.docs.length} documents.`);

      return snap.docs
        .map((doc: FirebaseFirestore.QueryDocumentSnapshot) => doc.data().token as string)
        .filter(Boolean);
    });

    const tokenArrays = await Promise.all(tokenPromises);
    const allTokens = tokenArrays.flat();

    logger.info(`[Step 5] getAllCustodianFcmTokens() complete. A total of ${allTokens.length} tokens were found.`);

    return allTokens;
  } catch (error) {
    logger.error(`[FATAL] ERR: getAllCustodianFcmTokens() failed: ${error}`);
    throw error;
  }
}