import { Request, Response } from "express";
import { logger } from '../utils/logger';
import { createReportValidation } from "../validations/report.validation";
import { sendResponse } from "../utils/send-response";
import { upload } from "./storage.controller";
import { IAreaReport, ICategoryReport, IPersonReport, IReport } from "../models/report.model";
import { generateUID } from "../utils/generate-uid";
import { getWIBDate } from "../utils/wib-date";
import { createReportByCampusId } from "../services/report.service";

export const createReport = async (req: Request, res: Response) => {
  const { error, value } = createReportValidation(req.body);

  if (error) {
    logger.error(`ERR: report - create = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  const file = req.file;

  if (!file) {
    return sendResponse(res, false, 400, "No image uploaded");
  }

  try {
    const reportImage = await upload(file, 'reports/images');

    // todo ai checker

    const complainant: IPersonReport = {
      personId: value.complainantId,
      name: value.complainantName,
      email: value.complainantEmail,
    };

    const custodian: IPersonReport = {
      personId: value.custodianId,
      name: value.custodianName,
      email: value.custodianEmail,
    };

    const area: IAreaReport = {
      areaId: value.areaId,
      name: value.areaName,
    };

    const category: ICategoryReport = {
      categoryId: value.categoryId,
      name: value.categoryName,
    };

    const report: IReport = {
      id: generateUID(),
      complainant: [complainant],
      custodian: custodian,
      area: area,
      category: category,
      campusId: value.campusId,
      description: value.description,
      image: reportImage,
      status: 'PENDING',
      count: 0,
      isDeleted: false,
      createdDate: getWIBDate(),
      createdBy: complainant.name,
      lastUpdatedDate: getWIBDate(),
      lastUpdatedBy: complainant.name,
    };

    await createReportByCampusId(report);

    return sendResponse(res, true, 200, "Report created successfully");
  } catch (err: any) {
    logger.error(`ERR: report - create = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}