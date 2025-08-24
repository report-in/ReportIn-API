import { Request, Response } from 'express';
import { logger } from '../utils/logger';
//import { userAreaValidation } from '../validations/area.validation';
import { IResponse } from '../types/response/response.interface';
import { admin } from '../config/firebase';
import { IArea } from '../models/area.model';
import { getWIBDate } from '../utils/wib-date';
import { createAreaByCampusId, deleteAreaByAreaId, getAllAreaByCampusId, getAreaByBeaconIdAndCampusId, getAreaById, getAreaByNameAndCampusId, updateAreaByAreaId } from '../services/area.service';
import { generateUID } from '../utils/generate-uid';
import { sendResponse } from '../utils/send-response';
import { getAllAreaValidation, updateAreaValidation, createAreaValidation, deleteAreaValidation } from '../validations/area.validation';
import { IBeacon } from '../models/beacon.model';
import { createBeaconByBeaconId, deleteBeaconByCampusId } from '../services/beacon.service';
import { getUsername } from '../utils/header';

export const getAllArea = async (req: Request, res: Response) => {
  const { error, value } = getAllAreaValidation(req.body);

  if (error) {
    logger.error(`ERR: area - getAllArea = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    const areas = await getAllAreaByCampusId(value.campusId);

    return sendResponse(res, true, 200, 'Get All Area Success', areas);
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
    const beacon: IBeacon = {
      id: value.beaconId,
      campusId: value.campusId,
      isDeleted: false,
      createdDate: getWIBDate(),
      createdBy: getUsername(req),
      lastUpdatedDate: getWIBDate(),
      lastUpdatedBy: getUsername(req),
    }

    const area: IArea = {
      id: generateUID(),
      beaconId: value.beaconId,
      campusId: value.campusId,
      name: value.areaName,
      isDeleted: false,
      createdDate: getWIBDate(),
      createdBy: getUsername(req),
      lastUpdatedDate: getWIBDate(),
      lastUpdatedBy: getUsername(req),
    };

    const existingArea = await getAreaByNameAndCampusId(value.areaName, value.campusId);
    const existingBeacon = await getAreaByBeaconIdAndCampusId(value.beaconId, value.campusId);
    if (existingArea) {
      logger.error('Area name already exist');
      return sendResponse(res, false, 422, 'Area name already exist');
    } else if (existingBeacon) {
      logger.error('Beacon Id already exist');
      return sendResponse(res, false, 422, 'Beacon Id already exist');
    }

    await createAreaByCampusId(area);
    await createBeaconByBeaconId(beacon);

    return sendResponse(res, true, 200, "Area and Beacon created successfully");
  } catch (err: any) {
    logger.error(`ERR: Area and Beacon - create = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}

export const updateArea = async (req: Request, res: Response) => {
  const { error, value } = updateAreaValidation(req.body);

  if (error) {
    logger.error(`ERR: area - updateArea = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    const { id, campusId, beaconId, areaName } = value;

    const currentArea = await getAreaById(id);
    if (!currentArea) {
      logger.error(`ERR: area with ID ${id} not found`);
      return sendResponse(res, false, 404, "Area not found");
    }

    const existingArea = await getAreaByNameAndCampusId(areaName, campusId);
    const existingBeacon = await getAreaByBeaconIdAndCampusId(beaconId, campusId);
    if (existingArea && existingArea.name.toLowerCase() == areaName.toLowerCase()) {
      logger.error('Area name already exist');
      return sendResponse(res, false, 422, 'Area name already exist');
    } else if (existingBeacon && existingBeacon.beaconId.toLowerCase() == beaconId.toLowerCase()) {
      logger.error('Beacon Id already exist');
      return sendResponse(res, false, 422, 'Beacon Id already exist');
    }

    const newBeacon: IBeacon = {
      id: beaconId,
      campusId: campusId,
      isDeleted: false,
      createdDate: getWIBDate(),
      createdBy: getUsername(req),
      lastUpdatedDate: getWIBDate(),
      lastUpdatedBy: getUsername(req),
    }

    const updatedArea: IArea = {
      ...currentArea,
      beaconId: beaconId,
      name: areaName,
      lastUpdatedBy: getUsername(req),
      lastUpdatedDate: getWIBDate()
    };

    if (existingBeacon && existingBeacon.beaconId.toLowerCase() !== beaconId.toLowerCase()) {
      await deleteBeaconByCampusId(existingBeacon.beaconId, existingBeacon.campusId);
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
  const id = req.query.id;

  if (typeof id !== 'string') {
    logger.error(`ERR: area - deleteArea = invalid or missing id`);
    return sendResponse(res, false, 400, 'Invalid or missing id in query param');
  }

  const { error, value } = deleteAreaValidation(id);

  if (error) {
    logger.error(`ERR: area - deleteArea = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    ///tambahin logic buat ngecek apakah ada report yang masih statusnya belom done 
    //get report by status 
    const areaToDelete = await getAreaById(id);
    if (!areaToDelete) {
      logger.error('ERR: area with ID ${id} not found');
      return sendResponse(res, false, 422, 'Area not found');
    }

    await deleteAreaByAreaId(value.id);
    await deleteBeaconByCampusId(areaToDelete?.beaconId, areaToDelete?.campusId);

    return sendResponse(res, true, 200, 'Delete Area Success');
  } catch (err: any) {
    logger.error(`ERR: Area - delete = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}

