import { Request, response, Response } from 'express';
import { logger } from '../utils/logger';
import { IResponse } from '../types/response/response.interface';
import { sendResponse } from '../utils/send-response';
import { getAllCategoryByCampusId } from '../services/category.services';
import { getAllCategoryValidation } from '../validations/category.validation';
import { any } from 'joi';


export const getAllCategory = async (req: Request, res: Response) => {
  const { error, value } = getAllCategoryValidation(req.body);

  if (error) {
    logger.error(`ERR: category - getAll = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    const categories = await getAllCategoryByCampusId(value.campusId);

    return sendResponse(res, true, 200, 'Success get all category', categories);
  } catch (err: any) {
    logger.error(`ERR: category - getAll = ${err}`);
    return sendResponse(res, false, 500, 'Failed to get category', []);
  }
}