import { db } from "../config/firebase";
import { IFacilityItem } from "../models/FacilityItem.model";
import { IGetFacilityItemResponse } from "../types/response/facility-item.response";
import { logger } from "../utils/logger";

export const getAllFacilityItemByCampusandAreaId = async (
  campusId: string,
  areaId: string,
  search: string,
  limit: number,
  offset: number
): Promise<{ data: IGetFacilityItemResponse[]; totalItems: number }> => {
  try {
    const snapshot = await db
      .collection("FacilityItem")
      .where("campusId", "==", campusId)
      .where("areaId", "==", areaId)
      .where("isDeleted", "==", false)
      .get();

    if (snapshot.empty) {
      return { data: [], totalItems: 0 };
    }

    let facilityitems: IGetFacilityItemResponse[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      facilityitems.push({
        id: doc.id,
        campusId: data.campusId,
        areaId: data.areaId,
        name: data.name,
        isDeleted: data.isDeleted,
        createdBy: data.createdBy,
        createdDate: data.createdDate,
        lastUpdatedBy: data.lastUpdatedBy,
        lastUpdatedDate: data.lastUpdatedDate,
      });
    });

    if (search) {
      const searchLower = search.toLowerCase();
      facilityitems = facilityitems.filter((a) =>
        a.name.toLowerCase().includes(searchLower)
      );
    }

    const totalItems = facilityitems.length;

    const paginatedFacilityItem = limit === 0 ? facilityitems : facilityitems.slice(offset, offset + limit);

    return { data: paginatedFacilityItem, totalItems };
  } catch (error) {
    logger.error(`ERR: getAllFacilityItemByCampusandAreaId() = ${error}`);
    throw error;
  }
};

export const createFacilityItemByCampusandAreaId = async (facilityItem: IFacilityItem): Promise<void> => {
  try {
    await db.collection('FacilityItem').doc(facilityItem.id).set(facilityItem);
    logger.info(`Facility Item created = ${facilityItem.id} - ${facilityItem.name}`);
  } catch (error) {
    logger.error(`ERR: createFacilityByCampusandAreaId() = ${error}`)
    throw error;
  }
}

export const getFacilityItemById = async (id: string): Promise<IGetFacilityItemResponse | null> => {
  try {
    const facilityItemsRef = db.collection('FacilityItem');
    const querySnapshot = await facilityItemsRef.where('id', '==', id).where('isDeleted', '==', false).get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    const facilityitem: IGetFacilityItemResponse = {
      id: doc.id,
      areaId: data.areaId,
      name: data.name,
      campusId: data.campusId,
      isDeleted: data.isDeleted,
      createdBy: data.createdBy,
      createdDate: data.createdDate,
      lastUpdatedBy: data.lastUpdatedBy,
      lastUpdatedDate: data.lastUpdatedDate
    };

    return facilityitem;
  } catch (error) {
    logger.error(`ERR: getFacilityItemById() = ${error}`)
    throw error;
  }
};

export const updateFacilityItemByFacilityItemId = async (facilityItem: IFacilityItem): Promise<void> => {
  try {
    await db.collection('FacilityItem').doc(facilityItem.id).update(facilityItem);
    logger.info(`Facility Item updated = ${facilityItem.id} - ${facilityItem.name}`);
  } catch (error) {
    logger.error(`ERR: updateFacilityItemByFacilityItemId() = ${error}`)
    throw error;
  }
}

export const deleteFacilityItemByFacilityItemId = async (id: string): Promise<void> => {
  try {
    await db.collection('Facility Item').doc(id).update({ isDeleted: true });
    logger.info(`Facility Item deleted = ${id}`);
  } catch (error) {
    logger.error(`ERR: deleteFacilityItemByFacilityItemId() = ${error}`)
    throw error;
  }
}