import { db } from "../config/firebase";
import { ITechnicianPreference } from "../models/technician-preference.model";
import { Preference } from "../types/request/technician-preference.request";
import { logger } from "../utils/logger";

export const getAllTechnicianPreferenceBasedOnPersonIdAndCampusId = async (
  personId: string,
  campusId: string
): Promise<string[] | null> => {
  try {
    const snapshot = await db
      .collection("TechnicianPreference")
      .where("personId", "==", personId)
      .where("campusId", "==", campusId)
      .get();

    if (snapshot.empty) {
      logger.info(
        `No TechnicianPreference found for personId=${personId}, campusId=${campusId}`
      );
      return null;
    }

    const categoryIds = snapshot.docs.map((doc) => doc.data().categoryId as string);

    logger.info(
      `Found ${categoryIds.length} TechnicianPreference(s) for personId=${personId}, campusId=${campusId}`
    );

    return categoryIds;
  } catch (error) {
    logger.error(
      `ERR: getAllTechnicianPreferenceBasedOnPersonIdAndCampusId() = ${error}`
    );
    throw error;
  }
};

export const deleteTechnicianPreferenceBasedOnPreference = async (
  preference: Preference
): Promise<boolean | null> => {
  try {
    // Query ke Firestore
    const snapshot = await db
      .collection("TechnicianPreference")
      .where("personId", "==", preference.personId)
      .where("campusId", "==", preference.campusId)
      .get();

    if (snapshot.empty) {
      logger.info(
        `No TechnicianPreference found for personId=${preference.personId}, campusId=${preference.campusId}, categoryId=${preference.categoryId}`
      );
      return null;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    logger.info(
      `Deleted ${snapshot.size} TechnicianPreference(s) for personId=${preference.personId}, campusId=${preference.campusId}, categoryId=${preference.categoryId}`
    );

    return true;
  } catch (error) {
    logger.error(`ERR: deleteTechnicianPreferenceBasedOnPreference() = ${error}`);
    throw error;
  }
};

export const createTechnicianPreferenceService = async (technicianPreference: ITechnicianPreference): Promise<boolean | null> => {
  try {
    await db.collection('TechnicianPreference').doc(technicianPreference.id).set(technicianPreference);
    logger.info(`TechnicianPreference Created = ${technicianPreference.id} - ${technicianPreference.personId}`);
    return true;
  } catch (error) {
    logger.error(`ERR: createTechnicianPreference() = ${error}`)
    throw error;
  }
}