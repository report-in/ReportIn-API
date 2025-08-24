import { db } from '../config/firebase';
import { IArea } from '../models/area.model';
import { logger } from '../utils/logger';
import { IGetAreaResponse } from '../types/response/area.response';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const getAllAreaByCampusId = async (campusId: string): Promise<IGetAreaResponse[] | null> => {
  try {
    const areasRef = db.collection('Area');
    const querySnapshot = await areasRef.where('campusId', '==', campusId).where('isDeleted', '==', false).get();

    if (querySnapshot.empty) {
      return null;
    }

    const areas: IGetAreaResponse[] = [];

    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();

      areas.push({
        id: doc.id,
        name: data.name,
        beaconId: data.beaconId,
        campusId: data.campusId,
        isDeleted: data.isDeleted,
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

export const createAreaByCampusId = async (area: IArea): Promise<void> => {
  try {
    await db.collection('Area').doc(area.id).set(area);
    logger.info(`Area created = ${area.id} - ${area.name}`);
  } catch (error) {
    logger.error(`ERR: createAreaByCampusId() = ${error}`)
    throw error;
  }
}

export const updateAreaByAreaId = async (area: IArea): Promise<void> => {
  try {
    await db.collection('Area').doc(area.id).update(area);
    logger.info(`Area updated = ${area.id} - ${area.name}`);
  } catch (error) {
    logger.error(`ERR: updateAreaByAreaId() = ${error}`)
    throw error;
  }
}

export const deleteAreaByAreaId = async (area: IArea): Promise<void> => {
  try {
    await db.collection('Area').doc(area.id).update({ isDeleted: true });
    logger.info(`Area deleted = ${area.id} - ${area.name}`);
  } catch (error) {
    logger.error(`ERR: deleteAreaByAreaId() = ${error}`)
    throw error;
  }
}

export const getAreaById = async (id: string): Promise<IGetAreaResponse | null> => {
  try {
    const areasRef = db.collection('Area');
    const querySnapshot = await areasRef.where('id', '==', id).where('isDeleted', '==', false).get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    const area: IGetAreaResponse = {
      id: doc.id,
      name: data.name,
      beaconId: data.beaconId,
      campusId: data.campusId,
      isDeleted: data.isDeleted,
      createdBy: data.createdBy,
      createdDate: data.createdDate,
      lastUpdatedBy: data.lastUpdatedBy,
      lastUpdatedDate: data.lastUpdatedDate
    };

    return area;
  } catch (error) {
    logger.error(`ERR: getAreaById() = ${error}`)
    throw error;
  }
};

export const getAreaByNameAndCampusId = async (areaName: string, campusId: string): Promise<IGetAreaResponse | null> => {
  try {
    const areasRef = db.collection('Area');
    const querySnapshot = await areasRef.where('campusId', '==', campusId).where('name', '==', areaName).where('isDeleted', '==', false).get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    const area: IGetAreaResponse = {
      id: doc.id,
      name: data.name,
      beaconId: data.beaconId,
      campusId: data.beaconId,
      isDeleted: data.isDeleted,
      createdBy: data.createdBy,
      createdDate: data.createdDate,
      lastUpdatedBy: data.lastUpdatedBy,
      lastUpdatedDate: data.lastUpdatedDate
    };

    return area;
  } catch (error) {
    logger.error(`ERR: getAreaByNameAndCampusId() = ${error}`)
    throw error;
  }
};

export const getAreaByBeaconIdAndCampusId = async (beaconId: string, campusId: string): Promise<IGetAreaResponse | null> => {
  try {
    const areasRef = db.collection('Area');
    const querySnapshot = await areasRef.where('campusId', '==', campusId).where('beaconId', '==', beaconId).where('isDeleted', '==', false).get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    const area: IGetAreaResponse = {
      id: doc.id,
      name: data.name,
      beaconId: data.beaconId,
      campusId: data.campusId,
      isDeleted: data.isDeleted,
      createdBy: data.createdBy,
      createdDate: data.createdDate,
      lastUpdatedBy: data.lastUpdatedBy,
      lastUpdatedDate: data.lastUpdatedDate
    };

    return area;
  } catch (error) {
    logger.error(`ERR: getAreaByBeaconIdAndCampusId() = ${error}`)
    throw error;
  }
}

