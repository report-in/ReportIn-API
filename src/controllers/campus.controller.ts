import { Request, Response } from "express";
import { sendResponse } from "../utils/send-response";
import { logger } from "../utils/logger";
import { createCampusByCampusId, deleteCampusById, getAllCampusByUserIdService, getAllCampusService, getCampusById, getCampusBySiteName, updateCampusByCampusId } from "../services/campus.services";
import { createCampusValidation, getSubdomainValidation, updateCampusValidation, verificationCampusValidation } from "../validations/campus.validation";
import { ICampus } from "../models/campus.model";
import { generateUID } from "../utils/generate-uid";
import { ICustomizationForm } from "../types/request/customization.request";
import { getWIBDate } from "../utils/wib-date";
import { getUsername } from "../utils/header";
import { upload } from "./storage.controller";
import { createCustomizationByCampusId, deleteCustomizationByCampusId, getCustomizationByCampusId, updateCustomizationByCustomizationId } from "../services/customization.service";
import { ICustomization } from "../models/customization.model";
import { getUserByUserId } from "../services/user.service";
import { IGetCampusDetailResponse, IGetSubdomainCampusResponse } from "../types/response/campus.response";
import { LIMIT } from "../constant/limit";
import { IMeta } from "../types/response/response.interface";

export const getAllCampus = async (req: Request, res: Response) => {
  const { search = '', page = '1', limit = LIMIT } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  try {
    const { data, totalItems } = await getAllCampusService(
      search as string,
      limitNum,
      offset
    );

    const meta: IMeta = {
      totalItems,
      page: pageNum,
      pageSize: limitNum,
      totalPages: Math.ceil(totalItems / limitNum)
    }
    return sendResponse(res, true, 200, 'Get All Campus Success', data, meta);
  } catch (err: any) {
    logger.error(`ERR: campus - getAllCampus = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};

export const getAllCampusByUserId = async (req: Request, res: Response) => {
  const { search = '', page = '1', limit = LIMIT } = req.query;
  const { userId } = req.params;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  if (!userId) {
    logger.error(`ERR: campus - getAllCampusByUserId = user Id not found`);
    return sendResponse(res, false, 422, "User Id not found");
  }

  try {
    const { data, totalItems } = await getAllCampusByUserIdService(
      userId as string,
      search as string,
      limitNum,
      offset
    );

    const meta: IMeta = {
      totalItems,
      page: pageNum,
      pageSize: limitNum,
      totalPages: Math.ceil(totalItems / limitNum)
    }
    return sendResponse(res, true, 200, 'Get All Campus By User Id Success', data, meta);
  } catch (err: any) {
    logger.error(`ERR: campus - getAllCampusByUserIdService = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};

export const createCampus = async (req: Request, res: Response) => {
  const { error, value } = createCampusValidation(req.body);

  if (error) {
    logger.error(`ERR: campus - createCampus = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  const files = req.files as {
    [fieldName: string]: Express.Multer.File[];
  };

  const logo = files?.['logo']?.[0];
  const documents = files?.['document'] || [];

  if (!logo || documents.length === 0) {
    return sendResponse(res, false, 400, "Need to upload image and document");
  }

  try {
    const campusLogo = await upload(logo, 'campus/logo');
    const campusDocument = await Promise.all(
      documents.map((doc) => upload(doc, 'campus/documents'))
    );

    const existingSite = await getCampusBySiteName(value.siteName);
    if (existingSite) {
      return sendResponse(res, false, 400, "Campus Site Name already exist");
    }

    const campus: ICampus = {
      id: generateUID(),
      userId: value.userId,
      name: value.name,
      mandatoryEmail: value.mandatoryEmail,
      siteName: value.siteName,
      document: campusDocument,
      provider: value.provider,
      status: "Pending",
      comment: "",
      isDeleted: false,
      createdDate: getWIBDate(),
      createdBy: getUsername(req),
      lastUpdatedDate: getWIBDate(),
      lastUpdatedBy: getUsername(req),
    }
    const customization: ICustomization = {
      id: generateUID(),
      campusId: campus.id,
      primaryColor: value.customization.primaryColor,
      logo: campusLogo,
      isDeleted: false,
      createdDate: getWIBDate(),
      createdBy: getUsername(req),
      lastUpdatedDate: getWIBDate(),
      lastUpdatedBy: getUsername(req),
    }

    await createCampusByCampusId(campus);
    await createCustomizationByCampusId(customization);


    return sendResponse(res, true, 200, "Campus created successfully");
  } catch (err: any) {
    logger.error(`ERR: campus - create = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}

export const updateCampus = async (req: Request, res: Response) => {
  const { error, value } = updateCampusValidation(req.body);
  const { params: { id } } = req;

  if (error) {
    logger.error(`ERR: campus - updateCampus = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }
  if (!id) {
    logger.error(`ERR: campus - updateCampus = campus Id not found`);
    return sendResponse(res, false, 422, "Campus Id not found");
  }

  const files = req.files as {
    [fieldName: string]: Express.Multer.File[];
  };

  const logo = files?.['logo']?.[0];
  const documents = files?.['document'] || [];

  if (!logo || documents.length === 0) {
    return sendResponse(res, false, 400, "Need to upload image and document");
  }

  try {
    const existingCampus = await getCampusById(id);
    if (!existingCampus) {
      logger.error(`ERR: campus with ID ${id} not found`);
      return sendResponse(res, false, 404, "Campus not found");
    }
    const existingCustomization = await getCustomizationByCampusId(existingCampus!.id);
    if (!existingCustomization) {
      logger.error(`ERR: customization with campus ID ${id} not found`);
      return sendResponse(res, false, 404, "Customization not found");
    }
    const campusLogo = await upload(logo, 'campus/logo');
    const campusDocument = await Promise.all(
      documents.map((doc) => upload(doc, 'campus/documents'))
    );

    const updatedCustomization: ICustomization = {
      ...existingCustomization,
      primaryColor: value.customization.primaryColor,
      logo: campusLogo
    }
    const updatedCampus: ICampus = {
      ...existingCampus,
      name: value.name,
      mandatoryEmail: value.mandatoryEmail,
      siteName: value.siteName,
      document: campusDocument,
      provider: value.provider,
      lastUpdatedBy: getUsername(req),
      lastUpdatedDate: getWIBDate()
    };

    await updateCampusByCampusId(updatedCampus);
    await updateCustomizationByCustomizationId(updatedCustomization);

    return sendResponse(res, true, 200, "Campus updated successfully");
  } catch (err: any) {
    logger.error(`ERR: Campus - update = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}

export const getCampusDetail = async (req: Request, res: Response) => {

  const { params: { id } } = req;
  if (!id) {
    logger.error(`ERR: campus - getCampusDetail = campus Id not found`);
    return sendResponse(res, false, 422, "Campus Id not found");
  }

  try {
    const campus = await getCampusById(id);
    return sendResponse(res, true, 200, 'Get Campus Detail By Campus Id Success', campus);
  } catch (err: any) {
    logger.error(`ERR: campus - getCampusById = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};

export const deleteCampus = async (req: Request, res: Response) => {
  const { params: { id } } = req;

  if (!id) {
    logger.error(`ERR: campus - deleteCampus = campus Id not found`);
    return sendResponse(res, false, 422, "Campus Id not found");
  }

  try {
    const campusToDelete = await getCampusById(id);
    if (!campusToDelete) {
      logger.error('ERR: campus with ID ${id} not found');
      return sendResponse(res, false, 422, 'Campus not found');
    }
    const customizationToDelete = await getCustomizationByCampusId(id);

    await deleteCampusById(id);
    await deleteCustomizationByCampusId(customizationToDelete!.id);

    return sendResponse(res, true, 200, 'Delete Campus Success');
  } catch (err: any) {
    logger.error(`ERR: Campus - delete = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};

export const verificationCampus = async (req: Request, res: Response) => {
  const { error, value } = verificationCampusValidation(req.body);
  console.log("aku disini");
  if (error) {
    logger.error(`ERR: campus - verificationCampus = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    const { userId, campusId } = value;

    //cek apakah userId ada role Super Admin
    const user = await getUserByUserId(userId);
    if (!user?.role.some((r: any) => r.roleName === "Super Admin")) {
      logger.error(`ERR: User with ID ${userId} is not Super Admin`);
      return sendResponse(res, false, 404, "User is not Super Admin");
    }

    //ambil campus existing
    const existingCampus = await getCampusById(campusId);
    if (!existingCampus) {
      logger.error(`ERR: campus with ID ${campusId} not found`);
      return sendResponse(res, false, 404, "Campus not found");
    }

    //update status dan commentnya
    const verifCampus: ICampus = {
      ...existingCampus,
      status: value.status,
      comment: value.comment,
      lastUpdatedBy: getUsername(req),
      lastUpdatedDate: getWIBDate()
    };

    await updateCampusByCampusId(verifCampus);

    return sendResponse(res, true, 200, "Campus updated successfully");
  } catch (err: any) {
    logger.error(`ERR: Campus - verify = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};

export const getSubdomain = async (req: Request, res: Response) => {
  const { error, value } = getSubdomainValidation(req.body);

  if (error) {
    logger.error(`ERR: campus - getSubdomainValidation = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    const campus = await getCampusBySiteName(value.subdomain);
    if (!campus) {
      logger.error(`ERR: campus with subdomain '${value.subdomain}' not found`);
      return sendResponse(res, false, 404, "Campus not found");
    }
    const customization = await getCustomizationByCampusId(campus?.campusId);
    if (!customization) {
      logger.error(`ERR: customization with campus ID '${campus.campusId}' not found`);
      return sendResponse(res, false, 404, "Customization not found");
    }

    const subdomainCampus: IGetSubdomainCampusResponse = {
      campusId: campus.campusId,
      name: campus.name,
      mandatoryEmail: campus.mandatoryEmail,
      siteName: campus.siteName,
      provider: campus.provider,
      customization: {
        customizationId: customization.campusId,
        primaryColor: customization.primaryColor,
        logo: customization.logo
      }
    }

    return sendResponse(res, true, 200, 'Get Campus Subdomain By Site Name Success', subdomainCampus);
  } catch (err: any) {
    logger.error(`ERR: campus - getCampusById = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};
