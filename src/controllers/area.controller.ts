import { Request, Response } from 'express';
import { logger } from '../utils/logger';
//import { userAreaValidation } from '../validations/area.validation';
import { IResponse } from '../types/response/response.interface';
import { admin } from '../config/firebase';
import { IArea } from '../models/area.model';
import { getWIBDate } from '../utils/wib-date';
import { getAllAreaByCampusId } from '../services/area.service';
import { generateUID } from '../utils/generate-uid';
import { sendResponse } from '../utils/send-response';
import { getAllAreaValidation } from '../validations/area.validation';

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
    logger.error(`ERR: user - login = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};