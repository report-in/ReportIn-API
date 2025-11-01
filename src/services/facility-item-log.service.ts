import { db } from "../config/firebase";
import { IFacilityItemLog } from "../models/facility-item-log.model";
import { IGetFacilityItemLogResponse } from "../types/response/facility-item-log";
import { logger } from "../utils/logger";

export const getAllFacilityItemLogByItemId = async (
  itemId: string,
  search: string,
  limit: number,
  offset: number
): Promise<{ data: IGetFacilityItemLogResponse[]; totalItems: number }> => {
  try {
    const snapshot = await db
      .collection("FacilityItemLog")
      .where("itemId", "==", itemId)
      .where("isDeleted", "==", false)
      .get();

    if (snapshot.empty) {
      return { data: [], totalItems: 0 };
    }

    let facilityitemLogs: IGetFacilityItemLogResponse[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      facilityitemLogs.push({
        id: doc.id,
        itemId: data.itemId,
        issue: data.issue,
        person: data.person,
        isDeleted: data.isDeleted,
        createdBy: data.createdBy,
        createdDate: data.createdDate,
        lastUpdatedBy: data.lastUpdatedBy,
        lastUpdatedDate: data.lastUpdatedDate,
      });
    });

    if (search) {
      const searchLower = search.toLowerCase();
      facilityitemLogs = facilityitemLogs.filter((a) =>
        a.issue.toLowerCase().includes(searchLower)
      );
    }

    const totalItems = facilityitemLogs.length;

    const paginatedFacilityItemLog = limit === 0 ? facilityitemLogs : facilityitemLogs.slice(offset, offset + limit);

    return { data: paginatedFacilityItemLog, totalItems };
  } catch (error) {
    logger.error(`ERR: getAllFacilityItemLogByItemId() = ${error}`);
    throw error;
  }
};

export const createFacilityItemLogByItemId = async (facilityItemLog: IFacilityItemLog): Promise<void> => {
  try {
    await db.collection('FacilityItemLog').doc(facilityItemLog.id).set(facilityItemLog);
    logger.info(`Facility Item created = ${facilityItemLog.id} - ${facilityItemLog.issue}`);
  } catch (error) {
    logger.error(`ERR: createFacilityItemLogByItemId() = ${error}`)
    throw error;
  }
}