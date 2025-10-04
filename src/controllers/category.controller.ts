import { Request, response, Response } from 'express';
import { logger } from '../utils/logger';
import { IMeta, IResponse } from '../types/response/response.interface';
import { sendResponse } from '../utils/send-response';
import { createCategory, deleteCategoryService, getAllCategoryByCampusId, updateCategoryById } from '../services/category.services';
import { createCategoryValidation, deleteCategoryValidation, getAllCategoryValidation, updateCategoryValidation } from '../validations/category.validation';
import { any } from 'joi';
import { getUsername } from '../utils/header';
import { LIMIT } from '../constant/limit';
import { Dilation2DBackpropFilter } from '@tensorflow/tfjs';
import { ICategory } from '../models/category.model';


export const getAllCategory = async (req: Request, res: Response) => {
  const { campusId, search = '', page = '1', limit = LIMIT, all } = req.query;

  if (!campusId) {
    logger.error(`ERR: category - getAllCategory = Campus Id is required`);
    return sendResponse(res, false, 422, 'campusId is required');
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  try {
    let data: ICategory[] = [];
    let totalItems = 0;
    let meta: IMeta | undefined;

    if (all === "true") {
          const result = await getAllCategoryByCampusId(campusId as string, search as string, 0, 0);
          data = result.data;
          totalItems = result.totalItems;
        } else {
          const pageNum = parseInt(page as string, 10);
          const limitNum = parseInt(limit as string, 10);
          const offset = (pageNum - 1) * limitNum;
    
          const result = await getAllCategoryByCampusId(campusId as string, search as string, limitNum, offset);
          data = result.data;
          totalItems = result.totalItems;
    
          meta = {
            totalItems,
            page: pageNum,
            pageSize: limitNum,
            totalPages: Math.ceil(totalItems / limitNum)
          }
        }

    return sendResponse(res, true, 200, 'Success get all category', data,meta);
  } catch (err: any) {
    logger.error(`ERR: category - getAll = ${err}`);
    return sendResponse(res, false, 500, 'Failed to get category', []);
  }
}

export const createCategoryController = async (req: Request, res: Response) => {
  console.log(req.body);
  const { error, value } = createCategoryValidation(req.body);

  if (error) {
    logger.error(`ERR: category - create = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    await createCategory(req);

    return sendResponse(res, true, 201, "Success create category", null);
  } catch (err: any) {
    logger.error(`ERR: category - create = ${err.message}`);
    return sendResponse(res, false, 400, err.message, null);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  // validasi body
  const { error, value } = updateCategoryValidation(req.body);
  if (error) {
    logger.error(`ERR: category - update = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  // pastikan param id ada
  const id = req.params?.id;
  if (!id) {
    logger.error(`ERR: category - update = missing param id`);
    return sendResponse(res, false, 400, "Category id param is required");
  }

  try {
    const username = getUsername(req);
    await updateCategoryById(id, value.campusId, value.name, username);

    return sendResponse(res, true, 200, "Success update category", null);
  } catch (err: any) {
    // 404 kalau not found, selain itu 400/500 sesuai pesan
    const msg = err?.message || "Failed to update category";
    logger.error(`ERR: category - update = ${msg}`);

    // mapping sederhana untuk not found
    if (msg.includes("not found")) {
      return sendResponse(res, false, 404, msg, null);
    }

    // duplikat/name exists -> 400, selainnya 500
    if (msg.includes("already exists")) {
      return sendResponse(res, false, 400, msg, null);
    }

    return sendResponse(res, false, 500, msg, null);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { error } = deleteCategoryValidation(req.params);
  if (error) {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: error.details[0].message,
      data: null,
    });
  }

  const { id } = req.params;

  const result = await deleteCategoryService(id);
  return res.status(result.statusCode).json(result);
};