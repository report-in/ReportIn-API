import { string } from "joi";
import { db } from "../config/firebase";
import { ICustomization } from "../models/customization.model";
import { IGetCustomizationDetailResponse, IGetCustomizationResponse } from "../types/response/customization.response";
import { logger } from "../utils/logger";

export const createCustomizationByCampusId = async (customization: ICustomization): Promise<void> => {
  try {
    await db.collection('Customization').doc(customization.id).set(customization);
    logger.info(`Customization Campus created = ${customization.id}`);
  } catch (error) {
    logger.error(`ERR: createCustomizationByCampusId() = ${error}`)
    throw error;
  }
};

export const updateCustomizationByCustomizationId = async (customization: ICustomization): Promise<void> => {
  try {
    await db.collection('Customization').doc(customization.id).update(customization);
    logger.info(`Customization updated = ${customization.id} - ${customization.campusId}`);
  } catch (error) {
    logger.error(`ERR: updateCustomizationByCustomizationId() = ${error}`)
    throw error;
  }
}

export const getCustomizationByCampusId = async (campusId: string): Promise<IGetCustomizationDetailResponse | null> => {
  try {
    const customizationRef = db.collection('Customization');
    const querySnapshot = await customizationRef.where('campusId', '==', campusId).where('isDeleted', '==', false).get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    const customization: IGetCustomizationDetailResponse = {
      id: doc.id,
      campusId: data.campusId,
      primaryColor: data.primaryColor,
      logo: data.logo,
      isDeleted: data.isDeleted,
      createdBy: data.createdBy,
      createdDate: data.createdDate,
      lastUpdatedBy: data.lastUpdatedBy,
      lastUpdatedDate: data.lastUpdatedDate,
    };

    return customization;
  } catch (error) {
    logger.error(`ERR: getCustomizationByCampusId() = ${error}`)
    throw error;
  }
};

export const deleteCustomizationByCampusId = async (id: string): Promise<void> => {
  try {
    await db.collection('Customization').doc(id).update({ isDeleted: true });
    logger.info(`Customization deleted = ${id}`);
  } catch (error) {
    logger.error(`ERR: deleteCustomizationById() = ${error}`)
    throw error;
  }
}