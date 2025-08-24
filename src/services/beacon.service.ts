import { db } from '../config/firebase';
import { IArea } from '../models/area.model';
import { logger } from '../utils/logger';
import { IGetAreaResponse } from '../types/response/area.response';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { IBeacon } from "../models/beacon.model";

export const createBeaconByBeaconId = async (beacon: IBeacon): Promise<void> => {
  try {
    await db.collection('Beacon').doc(beacon.id).set(beacon);
    logger.info(`Beacon created = ${beacon.id}`);
  } catch (error) {
    logger.error(`ERR: createBeaconByBeaconId() = ${error}`)
    throw error;
  }
}

export const deleteBeaconByCampusId = async (beaconId: string, campusId: string): Promise<void> => {
  try {
    const snapshot = await db.collection('Beacon')
      .where('beaconId', '==', beaconId)
      .where('campusId', '==', campusId)
      .get();

    if (!snapshot.empty) {
      snapshot.forEach(async doc => {
        await db.collection('Beacon')
          .doc(doc.id)
          .update({ isDeleted: true });
      });
    }
    logger.info(`Beacon deleted = ${beaconId}`);
  } catch (error) {
    logger.error(`ERR: deleteBeaconByBeaconId() = ${error}`)
    throw error;
  }
}