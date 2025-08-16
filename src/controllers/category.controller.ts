import { Request, response, Response } from 'express';
import { logger } from '../utils/logger';
import { IResponse } from '../types/response/response.interface';
import { sendResponse } from '../utils/send-response';
import { createCategoryService, findCategoryByName, getAllCategoryByCampusId, getCategoryById, getReportsByCategoryId, softDeleteCategory, updateCategoryService } from '../services/category.services';
import { getAllCategoryValidation } from '../validations/category.validation';
import { any } from 'joi';
import { generateUID } from '../utils/generate-uid';
import { admin, db } from '../config/firebase';
import { ICategory } from '../models/category.model';


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

export const createCategory = async (req: Request, res: Response) => {
  const { campusId, name } = req.body;

  // 1. Validasi input sederhana
  if (!campusId || !name) {
    logger.error(`ERR: category - create = "campusId" and "name" are required`);
    return sendResponse(res, false, 422, `"campusId" and "name" are required`);
  }

  try {
    // 2. Cek apakah category sudah ada
    const existing = await findCategoryByName(campusId, name);
    if (existing.length > 0) {
      logger.error(`ERR: category - create = Category "${name}" already exists`);
      return sendResponse(res, false, 400, `Category "${name}" already exists`);
    }

    // 3. Generate UID
    const categoryId = generateUID();

    // 4. Buat object category baru
    const now = new Date().toISOString();
    const newCategory: ICategory = {
      id: categoryId,
      name,
      campusId,
      isDeleted: false,
      createdBy: "system", // nanti bisa diganti user login
      createdDate: now,
      lastUpdatedBy: "system",
      lastUpdatedDate: now
    };

    // 5. Simpan ke Firestore
    await createCategoryService(newCategory);

    // 6. Success Response
    return sendResponse(res, true, 201, `Category "${name}" created successfully`);

  } catch (err: any) {
    logger.error(`ERR: category - create = ${err}`);
    return sendResponse(res, false, 500, err.message || 'Failed to create category');
  }
};

export const updateCategoryById = async (req: Request, res: Response) => {
  const categoryId = req.params.id;
  const { campusId, name } = req.body;

  if (!campusId || !name) {
    return sendResponse(res, false, 422, "campusId and name are required");
  }

  const result = await updateCategoryService(categoryId, campusId, name);

  if (!result.success) {
    return sendResponse(res, false, 400, result.message);
  }

  return sendResponse(res, true, 200, result.message, null);
};

export const deleteCategoryById = async (req: Request, res: Response) => {
  const categoryId = req.params.id;

  try {
    //Cek apakah ada report yang belum selesai
    const reports = await getReportsByCategoryId(categoryId);
    if (reports.some(report => report.status !== "Done")) {
      return sendResponse(res, false, 400, "Cannot delete category. Some reports are not marked as 'Done'.");
    }

    //Cek apakah category ada
    const category = await getCategoryById(categoryId);
    if (!category || category.isDeleted) {
      return sendResponse(res, false, 404, "Category not found or already deleted.");
    }

    //Soft delete
    await softDeleteCategory(categoryId);

    //Response sukses
    return sendResponse(res, true, 200, `Category "${category.name}" deleted successfully.`);
  } catch (err: any) {
    logger.error(`ERR: category - deleteCategoryById = ${err}`);
    return sendResponse(res, false, 500, err.message || "Failed to delete category.");
  }
};