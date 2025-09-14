import { Request, Response } from "express";
import { logger } from '../utils/logger';
import { createReportValidation } from "../validations/report.validation";
import { sendResponse } from "../utils/send-response";
import { upload } from "./storage.controller";
import { IAreaReport, ICategoryReport, IPersonReport, IReport } from "../models/report.model";
import { generateUID } from "../utils/generate-uid";
import { getWIBDate } from "../utils/wib-date";

import { createReportByCampusId, getAllSimilarReports, getReportById, updateReportById } from "../services/report.service";
import { checkImageSimilarity } from "../services/ai.service";
import { getUsername } from "../utils/header";
import { sendNotification } from "./notification.controller";


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

    const similarReports = (await getAllSimilarReports({ areaId: value.areaId, campusId: value.campusId, categoryId: value.categoryId }));

    const similarReportResult = await checkImageSimilarity(file.buffer, similarReports, 0.7);

    if (similarReportResult.similar) {
      const report = await getReportById(similarReportResult.reportId);

      if (report) {
        const sameComplainant = report.complainant.some(
          (c) => c.personId === value.complainantId
        );

        if (sameComplainant) {
          return sendResponse(res, false, 409, "It appears you have already submitted a similar report. We do not allow multiple reports from the same person for the same issue.");
        }

        report.description.push(value.description);
        report.complainant.push({
          personId: value.complainantId,
          name: value.complainantName,
          email: value.complainantEmail
        });
        report.image.push(reportImage);
        report.count += 1;
        report.lastUpdatedBy = getUsername(req);
        report.lastUpdatedDate = getWIBDate();

        await updateReportById(report);
      }
    } else {
      const complainant: IPersonReport = {
        personId: value.complainantId,
        name: value.complainantName,
        email: value.complainantEmail,
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
        area: area,
        category: category,
        campusId: value.campusId,
        description: [value.description],
        image: [reportImage],
        status: 'PENDING',
        count: 0,
        isDeleted: false,
        createdDate: getWIBDate(),
        createdBy: getUsername(req),
        lastUpdatedDate: getWIBDate(),
        lastUpdatedBy: getUsername(req),
      };

      await createReportByCampusId(report);
      logger.info(`Calling sendNotification for campusId=${value.campusId}`);
      sendNotification(value.campusId, value.description, reportImage);
    }

    return sendResponse(res, true, 200, "Report created successfully");
  } catch (err: any) {
    logger.error(`ERR: report - create = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}