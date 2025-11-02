import { Request, Response } from "express";
import { LIMIT } from "../constant/limit";
import { logger } from "../utils/logger";
import { sendResponse } from "../utils/send-response";
import { IMeta } from "../types/response/response.interface";
import { IGetFacilityItemResponse } from "../types/response/facility-item.response";
import { createFacilityItemByCampusandAreaId, deleteFacilityItemByFacilityItemId, getAllFacilityItemByCampusandAreaId, getFacilityItemById, updateFacilityItemByFacilityItemId } from "../services/facility-item.service";
import { createFacilityItemValidation, updateFacilityItemValidation } from "../validations/facility-item.validation";
import { IFacilityItem } from "../models/facility-item.model";
import { generateUID } from "../utils/generate-uid";
import { getWIBDate } from "../utils/wib-date";
import { getUsername } from "../utils/header";
import { IGetFacilityItemLogResponse } from "../types/response/facility-item-log";
import { getAllFacilityItemLogByItemId } from "../services/facility-item-log.service";

export const getAllFacilityItemLog = async (req: Request, res: Response) => {
  const { itemId, search = '', page = '1', limit = LIMIT, all } = req.query;

  if (!itemId) {
    logger.error(`ERR: facilityItem - getAllFacilityItem = itemId is required`);
    return sendResponse(res, false, 422, 'itemId is required');
  }

  try {
    let data: IGetFacilityItemLogResponse[] = [];
    let totalItems = 0;
    let meta: IMeta | undefined;

    if (all === "true") {
      const result = await getAllFacilityItemLogByItemId(itemId as string, search as string, 0, 0);
      data = result.data;
      totalItems = result.totalItems;
    } else {
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const result = await getAllFacilityItemLogByItemId(itemId as string, search as string, limitNum, offset);
      data = result.data;
      totalItems = result.totalItems;

      meta = {
        totalItems,
        page: pageNum,
        pageSize: limitNum,
        totalPages: Math.ceil(totalItems / limitNum)
      }
    }

    return sendResponse(res, true, 200, 'Get All Facility Item Log Success', data, meta);
  } catch (err: any) {
    logger.error(`ERR: facilityItem - getAllFacilityItemLog = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};
