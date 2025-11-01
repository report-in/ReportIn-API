import { Request, Response } from "express";
import { LIMIT } from "../constant/limit";
import { logger } from "../utils/logger";
import { sendResponse } from "../utils/send-response";
import { IMeta } from "../types/response/response.interface";
import { IGetFacilityItemResponse } from "../types/response/facility-item.response";
import { createFacilityItemByCampusandAreaId, deleteFacilityItemByFacilityItemId, getAllFacilityItemByCampusandAreaId, getFacilityItemById, updateFacilityItemByFacilityItemId } from "../services/facility-item.service";
import { createFacilityItemValidation, updateFacilityItemValidation } from "../validations/facility-item.validation";
import { IFacilityItem } from "../models/FacilityItem.model";
import { generateUID } from "../utils/generate-uid";
import { getWIBDate } from "../utils/wib-date";
import { getUsername } from "../utils/header";

export const getAllFacilityItem = async (req: Request, res: Response) => {
  const { campusId, areaId, search = '', page = '1', limit = LIMIT, all } = req.query;

  if (!campusId) {
    logger.error(`ERR: facilityItem - getAllFacilityItem = Campus Id is required`);
    return sendResponse(res, false, 422, 'campusId is required');
  }
  if (!areaId) {
    logger.error(`ERR: facilityItem - getAllFacilityItem = Area Id is required`);
    return sendResponse(res, false, 422, 'areaId is required');
  }

  try {
    let data: IGetFacilityItemResponse[] = [];
    let totalItems = 0;
    let meta: IMeta | undefined;

    if (all === "true") {
      const result = await getAllFacilityItemByCampusandAreaId(campusId as string,areaId as string, search as string, 0, 0);
      data = result.data;
      totalItems = result.totalItems;
    } else {
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const result = await getAllFacilityItemByCampusandAreaId(campusId as string, areaId as string, search as string, limitNum, offset);
      data = result.data;
      totalItems = result.totalItems;

      meta = {
        totalItems,
        page: pageNum,
        pageSize: limitNum,
        totalPages: Math.ceil(totalItems / limitNum)
      }
    }

    return sendResponse(res, true, 200, 'Get All Facility Item Success', data, meta);
  } catch (err: any) {
    logger.error(`ERR: facilityItem - getAllFacilityitem = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};

export const createFacilityItem = async (req: Request, res: Response) => {
  const { error, value } = createFacilityItemValidation(req.body);

  if (error) {
    logger.error(`ERR: FacilityItem - createFacilityItem = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    const facilityItem: IFacilityItem = {
      id: generateUID(),
      campusId: value.campusId,
      areaId: value.areaId,
      name: value.name,
      isDeleted: false,
      createdDate: getWIBDate(),
      createdBy: getUsername(req),
      lastUpdatedDate: getWIBDate(),
      lastUpdatedBy: getUsername(req),
    };

    await createFacilityItemByCampusandAreaId(facilityItem);

    return sendResponse(res, true, 200, "Facility Item created successfully");
  } catch (err: any) {
    logger.error(`ERR: Facility Item - createFacilityItem = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}

export const updateFacilityItem = async (req: Request, res: Response) => {
  const { error, value } = updateFacilityItemValidation(req.body);
  const { params: { id } } = req

  if (error) {
    logger.error(`ERR: facility Item - updateFacilityItem = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  if (!id) {
    logger.error(`ERR: facility Item - updateFacilityItem = Facility Item id not found`);
    return sendResponse(res, false, 422, "Facility Item id not found");
  }

  try {
    const {name } = value;

    const currentFacilityItem = await getFacilityItemById(id);
    if (!currentFacilityItem) {
      logger.error(`ERR: Facility item  with ID ${id} not found`);
      return sendResponse(res, false, 404, "Facility Item not found");
    }
    const updatedFacilityItem: IFacilityItem = {
      ...currentFacilityItem,
      name: name,
      lastUpdatedBy: getUsername(req),
      lastUpdatedDate: getWIBDate()
    };
    await updateFacilityItemByFacilityItemId(updatedFacilityItem);

    return sendResponse(res, true, 200, "Facility Item updated successfully");
  } catch (err: any) {
    logger.error(`ERR: FacilityItem - update = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}

export const deleteFacilityItem = async (req: Request, res: Response) => {
  const { params: { id } } = req;

  if (typeof id !== 'string') {
    logger.error(`ERR: facility item - deleteFacilityItem = invalid or missing id`);
    return sendResponse(res, false, 400, 'Invalid or missing id in query param');
  }

  try {
    const facilityItemToDelete = await getFacilityItemById(id);
    if (!facilityItemToDelete) {
      logger.error('ERR: facility item with ID ${id} not found');
      return sendResponse(res, false, 422, 'Facility Item not found');
    }

    await deleteFacilityItemByFacilityItemId(id);

    return sendResponse(res, true, 200, 'Delete Facility Item Success');
  } catch (err: any) {
    logger.error(`ERR: Facility Item - delete = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}

