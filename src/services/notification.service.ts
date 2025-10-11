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

export const getReportPersonFcmTokens = async (
  reportId: string
): Promise<
  { tokens: string[]; description: string; image: string; personId: string }[]
> => {
  try {
    logger.info(`Starting getReportPersonFcmData for reportId: ${reportId}`);

    // Step 1: Ambil data report
    const reportSnap = await db.collection('Report').doc(reportId).get();

    if (!reportSnap.exists) {
      logger.warn(`Report with ID ${reportId} not found.`);
      return [];
    }

    const reportData = reportSnap.data();
    const campusId = reportData?.campusId;
    const persons = reportData?.person ?? [];

    if (!Array.isArray(persons) || persons.length === 0) {
      logger.warn(`No person data found in report ${reportId}.`);
      return [];
    }

    logger.info(`[Step 1] Report loaded. Found ${persons.length} persons.`);

    // Step 2: Ambil token untuk tiap person
    const resultPromises = persons.map(async (person: any) => {
      const personId = person.personId || person.id;
      const description = person.description ?? '';
      const image = person.image ?? '';

      if (!personId) {
        logger.warn('Person object missing personId. Skipping.');
        return null;
      }

      logger.info(`[Step 2] Searching Notification tokens for personId=${personId}`);

      const snap = await db
        .collection('Notification')
        .where('personId', '==', personId)
        .where('campusId', '==', campusId)
        .get();

      const tokens = snap.docs
        .map((doc) => doc.data().token as string)
        .filter(Boolean);

      const uniqueTokens = [...new Set(tokens)];

      logger.info(
        `[Step 3] Found ${uniqueTokens.length} tokens for personId=${personId}, description="${description}".`
      );

      return {
        personId,
        tokens: uniqueTokens,
        description,
        image,
      };
    });

    const resultArray = (await Promise.all(resultPromises)).filter(Boolean);

    logger.info(`[Step 4] Finished collecting FCM data for ${resultArray.length} persons.`);

    return resultArray as {
      tokens: string[];
      description: string;
      image: string;
      personId: string;
    }[];
  } catch (error) {
    logger.error(`[FATAL] ERR: getReportPersonFcmData() failed: ${error}`);
    throw error;
  }
};