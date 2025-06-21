import { db } from '../config/firebase';
import { IArea } from '../models/area.model';
import { logger } from '../utils/logger';
import { IGetAllAreaResponse } from '../types/response/area.response';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const getAllAreaByCampusId = async (campusId: string): Promise<IGetAllAreaResponse[] | null> => {
  try {
    const areasRef = db.collection('Area');
    const querySnapshot = await areasRef.where('campusId', '==', campusId).where('isDeleted', '==', false).get();

    if (querySnapshot.empty) {
      return null;
    }

    const areas: IGetAllAreaResponse[] = [];

    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();

      areas.push({
        id: doc.id,
        name: data.name,
        beaconId: data.beaconId,
        createdBy: data.createdBy,
        createdDate: data.createdDate,
        lastUpdatedBy: data.lastUpdatedBy,
        lastUpdatedDate: data.lastUpdatedDate,
      });
    });

    return areas;
  } catch (error) {
    logger.error(`ERR: getAllArea() = ${error}`)
    throw error;
  }
};
