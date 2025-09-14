import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { IGetCampusDetailResponse, IGetCampusResponse, IGetSubdomainCampusResponse } from "../types/response/campus.response";
import { custom, string } from "joi";
import { logger } from "../utils/logger";
import { ICampus } from "../models/campus.model";
import { getCustomizationByCampusId } from "./customization.service";

export const getAllCampusService = async (): Promise<IGetCampusResponse[] | null> => {
  try {
    const campusRef = db.collection('Campus').where('isDeleted', '==', false);
    const querySnapshot = await campusRef.get();

    if (querySnapshot.empty) {
      return null;
    }

    const campuses: IGetCampusResponse[] = [];

    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();

      campuses.push({
        id: doc.id,
        name: data.name,
        siteName: data.siteName,
        status: data.status
      });
    });

    return campuses;
  } catch (error) {
    logger.error(`ERR: getAllCampus() = ${error}`)
    throw error;
  }
};

export const getAllCampusByUserIdService = async (userId: string): Promise<IGetCampusResponse[] | null> => {
  try {
    const campusRef = db.collection('Campus');
    const querySnapshot = await campusRef.where('userId', '==', userId).where('isDeleted', '==', false).get();

    if (querySnapshot.empty) {
      return null;
    }

    const campuses: IGetCampusResponse[] = [];

    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();

      campuses.push({
        id: doc.id,
        name: data.name,
        siteName: data.siteName,
        status: data.status
      });
    });

    return campuses;
  } catch (error) {
    logger.error(`ERR: getAllCampusByUserIdService() = ${error}`)
    throw error;
  }
};

export const getCampusBySiteName = async (siteName: string): Promise<IGetSubdomainCampusResponse | null> => {
  try {
    const campusRef = db.collection('Campus');
    const querySnapshot = await campusRef.where('siteName', '==', siteName).where('isDeleted', '==', false).get();
    
    if (querySnapshot.empty) {
      return null;
    }
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    const customization = await getCustomizationByCampusId(data.id);

    const campus: IGetSubdomainCampusResponse = {
      campusId: data.id,
      name: data.name,
      mandatoryEmail: data.mandatoryEmail,
      siteName: data.name,
      provider: data.provider,
      customization: {
        customizationId: customization!.campusId,
        primaryColor: customization!.primaryColor,
        logo: customization!.logo
      }
    };

    return campus;
  } catch (error) {
    logger.error(`ERR: getCampusBySiteName() = ${error}`)
    throw error;
  }
};

export const createCampusByCampusId = async (campus: ICampus): Promise<void> => {
  try {
    await db.collection('Campus').doc(campus.id).set(campus);
    logger.info(`Campus created = ${campus.id} - ${campus.name}`);
  } catch (error) {
    logger.error(`ERR: createCampusByCampusId() = ${error}`)
    throw error;
  }
}

export const getCampusById = async (id: string): Promise<IGetCampusDetailResponse | null> => {
  try {
    const campusRef = db.collection('Campus');
    const querySnapshot = await campusRef.doc(id).get();

    if (!querySnapshot.exists) {
      return null;
    }

    const doc = querySnapshot;
    const data = doc.data()!;
    const customization = await getCustomizationByCampusId(id);
    
    const campus: IGetCampusDetailResponse = {
      id: doc.id,
      userId: data.userId,
      name: data.name,
      mandatoryEmail: data.mandatoryEmail,
      siteName: data.siteName,
      document: data.document,
      status: data.status,
      comment: data.comment,
      provider: data.provider,
      customization: {
        customizationId: customization!.id,
        primaryColor: customization!.primaryColor,
        logo: customization!.logo
      },
      isDeleted: data.isDeleted,
      createdBy: data.createdBy,
      createdDate: data.createdDate,
      lastUpdatedBy: data.lastUpdatedBy,
      lastUpdatedDate: data.lastUpdatedDate,
    };

    return campus;
  } catch (error) {
    logger.error(`ERR: getCampusById() = ${error}`)
    throw error;
  }
};

export const updateCampusByCampusId = async (campus: ICampus): Promise<void> => {
  try {
    await db.collection('Campus').doc(campus.id).update(campus);
    logger.info(`Campus updated = ${campus.id} - ${campus.name}`);
  } catch (error) {
    logger.error(`ERR: updateCampusByCampusId() = ${error}`)
    throw error;
  }
}

export const deleteCampusById = async (id: string): Promise<void> => {
  try {
    await db.collection('Campus').doc(id).update({ isDeleted: true });
    logger.info(`Campus deleted = ${id}`);
  } catch (error) {
    logger.error(`ERR: deleteCampusById() = ${error}`)
    throw error;
  }
};