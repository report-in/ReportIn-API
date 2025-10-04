import { db } from '../config/firebase';
import { IArea } from '../models/area.model';
import { logger } from '../utils/logger';
import { IGetAreaResponse } from '../types/response/area.response';

export const getAllAreaByCampusId = async (
  campusId: string,
  search: string,
  limit: number,
  offset: number
): Promise<{ data: IGetAreaResponse[]; totalItems: number }> => {
  try {
    const snapshot = await db
      .collection("Area")
      .where("campusId", "==", campusId)
      .where("isDeleted", "==", false)
      .get();

    if (snapshot.empty) {
      return { data: [], totalItems: 0 };
    }

    let areas: IGetAreaResponse[] = [];
    snapshot.forEach((doc) => {
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

    if (search) {
      const searchLower = search.toLowerCase();
      areas = areas.filter((a) =>
        a.name.toLowerCase().includes(searchLower)
      );
    }

    const totalItems = areas.length;

    const paginatedAreas = limit === 0 ? areas : areas.slice(offset, offset + limit);

    return { data: paginatedAreas, totalItems };
  } catch (error) {
    logger.error(`ERR: getAllAreaByCampusId() = ${error}`);
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

export const deleteAreaByAreaId = async (id: string): Promise<void> => {
  try {
    const reportSnap = await db
        .collection("Report")
        .where("areaId", "==", id)
        .where("isDeleted", "==", false)
        .get();
  
    if (!reportSnap.empty) {
      const hasNotDone = reportSnap.docs.some(
        (doc: FirebaseFirestore.QueryDocumentSnapshot) =>
          doc.data().status !== "Done"
      );

      if (hasNotDone) {
         return logger.error(`ERR: deleteAreaByAreaId = There's Report with status not Done`)
      }
    }else{
      await db.collection('Area').doc(id).update({ isDeleted: true });
    }
    
    logger.info(`Area deleted = ${id}`);
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

