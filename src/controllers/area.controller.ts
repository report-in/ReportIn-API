import { Request, Response } from 'express';
import { logger } from '../utils/logger';
//import { userAreaValidation } from '../validations/area.validation';
import { IMeta, IResponse } from '../types/response/response.interface';
import { admin } from '../config/firebase';
import { IArea } from '../models/area.model';
import { getWIBDate } from '../utils/wib-date';
import { createAreaByCampusId, deleteAreaByAreaId, getAllAreaByCampusId, getAreaByBeaconIdAndCampusId, getAreaById, getAreaByNameAndCampusId, updateAreaByAreaId } from '../services/area.service';
import { generateUID } from '../utils/generate-uid';
import { sendResponse } from '../utils/send-response';
import { getAllAreaValidation, updateAreaValidation, createAreaValidation } from '../validations/area.validation';
import { IBeacon } from '../models/beacon.model';
import { createBeaconByBeaconId, deleteBeaconByCampusId } from '../services/beacon.service';
import { getUsername } from '../utils/header';
import { LIMIT } from '../constant/limit';
import { IGetAreaResponse } from '../types/response/area.response';

export const getAllArea = async (req: Request, res: Response) => {
  const { campusId, search = '', page = '1', limit = LIMIT, all } = req.query;

  if (!campusId) {
    logger.error(`ERR: area - getAllArea = Campus Id is required`);
    return sendResponse(res, false, 422, 'campusId is required');
  }

  try {
    let data: IGetAreaResponse[] = [];
    let totalItems = 0;
    let meta: IMeta | undefined;

    if (all === "true") {
      const result = await getAllAreaByCampusId(campusId as string, search as string, 0, 0);
      data = result.data;
      totalItems = result.totalItems;
    } else {
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const result = await getAllAreaByCampusId(campusId as string, search as string, limitNum, offset);
      data = result.data;
      totalItems = result.totalItems;

      meta = {
        totalItems,
        page: pageNum,
        pageSize: limitNum,
        totalPages: Math.ceil(totalItems / limitNum)
      }
    }

    return sendResponse(res, true, 200, 'Get All Area Success', data, meta);
  } catch (err: any) {
    logger.error(`ERR: area - getAllArea = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};

export const createArea = async (req: Request, res: Response) => {
  const { error, value } = createAreaValidation(req.body);

  if (error) {
    logger.error(`ERR: area - createArea = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    let beacon: IBeacon | null = null;

    if (value.beaconId) {
      beacon = {
        id: value.beaconId,
        campusId: value.campusId,
        isDeleted: false,
        createdDate: getWIBDate(),
        createdBy: getUsername(req),
        lastUpdatedDate: getWIBDate(),
        lastUpdatedBy: getUsername(req),
      }
    }

    const area: IArea = {
      id: generateUID(),
      beaconId: value.beaconId ?? null,
      campusId: value.campusId,
      name: value.areaName,
      isDeleted: false,
      createdDate: getWIBDate(),
      createdBy: getUsername(req),
      lastUpdatedDate: getWIBDate(),
      lastUpdatedBy: getUsername(req),
    };

    const existingArea = await getAreaByNameAndCampusId(value.areaName, value.campusId);
    if (existingArea) {
      logger.error('Area name already exist');
      return sendResponse(res, false, 422, 'Area name already exist');
    }

    if (value.beaconId) {
      const existingBeacon = await getAreaByBeaconIdAndCampusId(value.beaconId, value.campusId);
      if (existingBeacon) {
        logger.error('Beacon Id already exist');
        return sendResponse(res, false, 422, 'Beacon Id already exist');
      }
    }

    await createAreaByCampusId(area);

    if (beacon) {
      await createBeaconByBeaconId(beacon);
    }

    return sendResponse(res, true, 200, "Area and Beacon created successfully");
  } catch (err: any) {
    logger.error(`ERR: Area and Beacon - create = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}

export const updateArea = async (req: Request, res: Response) => {
  const { error, value } = updateAreaValidation(req.body);
  const { params: { id } } = req

  if (error) {
    logger.error(`ERR: area - updateArea = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  if (!id) {
    logger.error(`ERR: area - updateArea = Area id not found`);
    return sendResponse(res, false, 422, "Area id not found");
  }

  try {
    const { campusId, beaconId, areaName } = value;

    const currentArea = await getAreaById(id);
    if (!currentArea) {
      logger.error(`ERR: area with ID ${id} not found`);
      return sendResponse(res, false, 404, "Area not found");
    }

    const existingArea = await getAreaByNameAndCampusId(areaName, campusId);
    if (existingArea && existingArea.name.toLowerCase() === areaName.toLowerCase() && currentArea.name != areaName) {
      logger.error('Area name already exist');
      return sendResponse(res, false, 422, 'Area name already exist');
    }

    let existingBeacon = null;
    if (beaconId) {
      existingBeacon = await getAreaByBeaconIdAndCampusId(beaconId, campusId);
      if (existingBeacon && existingBeacon.beaconId.toLowerCase() === beaconId.toLowerCase() && currentArea.beaconId !== beaconId) {
        logger.error('Beacon Id already exist');
        return sendResponse(res, false, 422, 'Beacon Id already exist');
      }
    }

    const updatedArea: IArea = {
      ...currentArea,
      beaconId: beaconId ?? null,
      name: areaName,
      lastUpdatedBy: getUsername(req),
      lastUpdatedDate: getWIBDate()
    };

    if (currentArea.beaconId && !beaconId) {
      await deleteBeaconByCampusId(currentArea.beaconId, currentArea.campusId);
    } else if (!currentArea.beaconId && beaconId) {
      const newBeacon: IBeacon = {
        id: beaconId,
        campusId: campusId,
        isDeleted: false,
        createdDate: getWIBDate(),
        createdBy: getUsername(req),
        lastUpdatedDate: getWIBDate(),
        lastUpdatedBy: getUsername(req),
      };
      await createBeaconByBeaconId(newBeacon);
    } else if (
      currentArea.beaconId && beaconId && currentArea.beaconId !== beaconId
    ) {
      await deleteBeaconByCampusId(currentArea.beaconId, currentArea.campusId);
      const newBeacon: IBeacon = {
        id: beaconId,
        campusId: campusId,
        isDeleted: false,
        createdDate: getWIBDate(),
        createdBy: getUsername(req),
        lastUpdatedDate: getWIBDate(),
        lastUpdatedBy: getUsername(req),
      };
      await createBeaconByBeaconId(newBeacon);
    }

    await updateAreaByAreaId(updatedArea);

    return sendResponse(res, true, 200, "Area updated successfully");
  } catch (err: any) {
    logger.error(`ERR: Area - update = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}

export const deleteArea = async (req: Request, res: Response) => {
  const { params: { id } } = req;

  if (typeof id !== 'string') {
    logger.error(`ERR: area - deleteArea = invalid or missing id`);
    return sendResponse(res, false, 400, 'Invalid or missing id in query param');
  }

  try {
    ///tambahin logic buat ngecek apakah ada report yang masih statusnya belom done 
    //get report by status 
    const areaToDelete = await getAreaById(id);
    if (!areaToDelete) {
      logger.error('ERR: area with ID ${id} not found');
      return sendResponse(res, false, 422, 'Area not found');
    }

    await deleteAreaByAreaId(id);
    await deleteBeaconByCampusId(areaToDelete?.beaconId, areaToDelete?.campusId);

    return sendResponse(res, true, 200, 'Delete Area Success');
  } catch (err: any) {
    logger.error(`ERR: Area - delete = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}

