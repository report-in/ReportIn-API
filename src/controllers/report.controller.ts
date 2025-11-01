import { Request, Response } from "express";
import { logger } from '../utils/logger';
import { createReportValidation, deleteReportValidation, exportExcelReportValidation, updateReportStatusValidation, updateReportValidation, upvoteReportValidation } from "../validations/report.validation";
import { sendResponse } from "../utils/send-response";
import { upload } from "./storage.controller";
import { IAreaReport, ICategoryReport, IPersonReport, IReport } from "../models/report.model";
import { generateUID } from "../utils/generate-uid";
import { getWIBDate } from "../utils/wib-date";

import { createReportByCampusId, deleteReportByReportId, exportReportToExcelByCampusId, getAllSimilarReports, getReportById, updateReportById, updateReportStatusById, upvoteReportService } from "../services/report.service";
import { checkImageSimilarity } from "../services/ai.service";
import { getUsername } from "../utils/header";
import { sendNotification, sendNotificationReportStatus } from "./notification.controller";
import { getPersonByPersonIdandCampusId } from "../services/person.service";
import { getLeaderboardByPersonId, updateCustodianPointById } from "../services/leaderboard.service";
import { ILeaderboard } from "../models/leaderboard.model";
import { getCategoryById } from "../services/category.services";
import { IFacilityItemLog, IPersonFacilityItemLog } from "../models/facility-item-log.model";
import { createFacilityItem } from "./facility-item.controller";
import { createFacilityItemLogByItemId } from "../services/facility-item-log.service";



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

        report.complainant.push({
          personId: value.complainantId,
          name: value.complainantName,
          email: value.complainantEmail,
          description: value.description,
          image: reportImage
        });

        report.count += 1;
        report.lastUpdatedBy = getUsername(req);
        report.lastUpdatedDate = getWIBDate();

        await updateReportById(report);
      }
    } else {
      const estimationCompletion = await getCategoryById(value.categoryId);

      const complainant: IPersonReport = {
        personId: value.complainantId,
        name: value.complainantName,
        email: value.complainantEmail,
        description: value.description,
        image: reportImage
      };

      const area: IAreaReport = {
        areaId: value.areaId,
        name: value.areaName,
      };

      const category: ICategoryReport = {
        categoryId: value.categoryId,
        name: value.categoryName,
        estimationCompletion: estimationCompletion ? `${estimationCompletion.estimationCompletionValue} ${estimationCompletion.estimationCompletionUnit}` : ''
      };

      const report: IReport = {
        id: generateUID(),
        complainant: [complainant],
        area: area,
        category: category,
        campusId: value.campusId,
        status: 'PENDING',
        count: 0,
        upvote: [],
        isDeleted: false,
        createdDate: getWIBDate(),
        createdBy: getUsername(req),
        lastUpdatedDate: getWIBDate(),
        lastUpdatedBy: getUsername(req),
      };

      await createReportByCampusId(report);
      logger.info(`Calling sendNotification for campusId=${value.campusId}`);
      await sendNotification(value.campusId, value.description, reportImage);
    }

    return sendResponse(res, true, 200, "Report created successfully");
  } catch (err: any) {
    logger.error(`ERR: report - create = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}

export const updateReport = async (req: Request, res: Response) => {
  const { error, value } = updateReportValidation(req.body);

  if (error) {
    logger.error(`ERR: report - update = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  const { params: { id } } = req;

  if (typeof id !== 'string') {
    logger.error(`ERR: report - updateReport = invalid or missing id`);
    return sendResponse(res, false, 400, 'Invalid or missing id in query param');
  }

  const file = req.file;

  if (!file) {
    return sendResponse(res, false, 400, "No image uploaded");
  }

  try {
    const reportImage = await upload(file, 'reports/images');

    const similarReports = (await getAllSimilarReports({ areaId: value.areaId, campusId: value.campusId, categoryId: value.categoryId }));

    const similarReportResult = await checkImageSimilarity(file.buffer, similarReports, 0.7);

    const existingReport = await getReportById(id);
    const duplicateReport = await getReportById(similarReportResult.reportId);

    const estimationCompletion = await getCategoryById(value.categoryId);

    if (!existingReport) {
      logger.error(`ERR: Report with ID ${id} not found`);
      return sendResponse(res, false, 404, "Report not found");
    }

    if (existingReport.count == 0 && !similarReportResult.similar) {
      const complainant: IPersonReport = {
        ...existingReport.complainant[0],
        description: value.description,
        image: reportImage
      };

      const area: IAreaReport = {
        areaId: value.areaId,
        name: value.areaName,
      };

      const category: ICategoryReport = {
        categoryId: value.categoryId,
        name: value.categoryName,
        estimationCompletion: estimationCompletion ? `${estimationCompletion.estimationCompletionValue} ${estimationCompletion.estimationCompletionUnit}` : ''
      };

      const updatedReport: IReport = {
        ...existingReport,
        complainant: [complainant],
        area: area,
        category: category,
        lastUpdatedDate: getWIBDate(),
        lastUpdatedBy: getUsername(req),
      };

      await updateReportById(updatedReport);
    }
    else if (similarReportResult.similar && existingReport.count == 0) {
      if (duplicateReport) {
        const sameComplainant = duplicateReport.complainant.some(
          (c) => c.personId === value.complainantId
        );

        if (sameComplainant) {
          return sendResponse(res, false, 409, "It appears you have already submitted a similar report. We do not allow multiple reports from the same person for the same issue.");
        }

        duplicateReport.complainant.push({
          personId: value.complainantId,
          name: value.complainantName,
          email: value.complainantEmail,
          description: value.description,
          image: reportImage
        });

        duplicateReport.count += 1;
        duplicateReport.lastUpdatedBy = getUsername(req);
        duplicateReport.lastUpdatedDate = getWIBDate();

        await updateReportById(duplicateReport);
      }
    }
    else if (existingReport.count > 0 && similarReportResult.similar) {
      if (existingReport) {
        const complainantIndex = existingReport.complainant.findIndex(c => c.personId === value.complainantId);
        existingReport.complainant[complainantIndex].description = value.description;
        existingReport.complainant[complainantIndex].image = reportImage;

        existingReport.lastUpdatedBy = getUsername(req);
        existingReport.lastUpdatedDate = getWIBDate();

        await updateReportById(existingReport);
      }
    } else {
      const complainant: IPersonReport = {
        personId: value.complainantId,
        name: value.complainantName,
        email: value.complainantEmail,
        description: value.description,
        image: reportImage
      };

      const area: IAreaReport = {
        areaId: value.areaId,
        name: value.areaName,
      };

      const category: ICategoryReport = {
        categoryId: value.categoryId,
        name: value.categoryName,
        estimationCompletion: estimationCompletion ? `${estimationCompletion.estimationCompletionValue} ${estimationCompletion.estimationCompletionUnit}` : ''
      };

      const report: IReport = {
        id: generateUID(),
        complainant: [complainant],
        area: area,
        category: category,
        campusId: value.campusId,
        status: 'PENDING',
        count: 0,
        upvote: [],
        isDeleted: false,
        createdDate: getWIBDate(),
        createdBy: getUsername(req),
        lastUpdatedDate: getWIBDate(),
        lastUpdatedBy: getUsername(req),
      };

      const removedPersonReport: IReport = {
        ...existingReport,
        complainant: existingReport.complainant.filter(
          c => c.personId !== value.complainantId
        ),
        count: existingReport.count -= 1
      };

      await updateReportById(removedPersonReport);
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

export const deleteReport = async (req: Request, res: Response) => {
  const { params: { id } } = req;

  const { error, value } = deleteReportValidation(req.body);

  if (error) {
    logger.error(`ERR: report - delete = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  if (typeof id !== 'string') {
    logger.error(`ERR: report - deleteReport = invalid or missing id`);
    return sendResponse(res, false, 400, 'Invalid or missing id in query param');
  }

  try {
    const reportToDelete = await getReportById(id);
    if (!reportToDelete) {
      logger.error('ERR: report with ID ${id} not found');
      return sendResponse(res, false, 422, 'Report not found');
    }

    await deleteReportByReportId(id, value.deletionRemark, getUsername(req));

    return sendResponse(res, true, 200, 'Delete Report Success');
  } catch (err: any) {
    logger.error(`ERR: Report - delete = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}

export const updateReportStatus = async (req: Request, res: Response) => {
  const { error, value } = updateReportStatusValidation(req.body);

  if (error) {
    logger.error(`ERR: report - updateReportStatus = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  const { params: { id } } = req;

  if (typeof id !== 'string') {
    logger.error(`ERR: report - updateReportStatus = invalid or missing id`);
    return sendResponse(res, false, 400, 'Invalid or missing id in query param');
  }

  try {
    const { custodianId, campusId, issue, itemId } = value;
    const person = await getPersonByPersonIdandCampusId(custodianId, campusId);
    const completionDate = value.status.toLowerCase() === 'done' ? getWIBDate() : '';

    const custodianPerson: IPersonReport = {
      personId: value.custodianId,
      name: person!.name,
      email: person!.email,
      description: '',
      image: ''
    }
    
    await updateReportStatusById(id, value.status, custodianPerson, completionDate, getUsername(req), getWIBDate());
    let message = "Report taken successfully.";

    if (value.status.toLowerCase() === 'done') {
      const existingLeaderboard = await getLeaderboardByPersonId(custodianId, campusId);
      if (existingLeaderboard) {
        const leaderboardData = existingLeaderboard.data() as ILeaderboard;
        const leaderboard: ILeaderboard = {
          ...leaderboardData,
          point: leaderboardData.point + 10,
          lastUpdatedBy: getUsername(req),
          lastUpdatedDate: getWIBDate()
        };
        await updateCustodianPointById(leaderboard);
        console.log(leaderboard);
      }

      const custodianDonePerson : IPersonFacilityItemLog = {
        personId: person!.id,
        name: person!.name,
        email: person!.email
      };

      const facilityItemLog : IFacilityItemLog = {
        id: generateUID(),
        itemId: itemId,
        issue: issue,
        person: custodianDonePerson,  
        isDeleted: false,
        lastUpdatedBy:getUsername(req),
        lastUpdatedDate:getWIBDate(),
        createdBy: getUsername(req),
        createdDate: getWIBDate()
      }

      await createFacilityItemLogByItemId(facilityItemLog);

      message = "Report has been marked as completed successfully.";
    }

    logger.info(`Calling sendNotification for campusId=${value.campusId}`);
    await sendNotificationReportStatus(id, value.status);
    return sendResponse(res, true, 200, message);
  } catch (err: any) {
    logger.error(`ERR: Report - updateReportStatus = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}

export const exportExcelReport = async (req: Request, res: Response) => {
  const { error, value } = exportExcelReportValidation(req.body);

  if (error) {
    logger.error(`ERR: Report - exportExcelReport = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    const { startDate, endDate, campusId } = value;

    const buffer = await exportReportToExcelByCampusId(startDate, endDate, campusId);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report-${startDate}-to-${endDate}.xlsx`);
    res.send(buffer);

  } catch (err: any) {
    logger.error(`ERR: Report - exportExcelReport = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}

export const upvoteReport = async (req: Request, res: Response) => {
  const { error, value } = upvoteReportValidation(req.body);

  if (error) {
    logger.error(`ERR: Report - upvoteReport = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    const { reportId, personId } = value;

    await upvoteReportService(reportId, personId);
    return sendResponse(res, true, 200, "Upvote Report Success");
  } catch (err: any) {
    logger.error(`ERR: Report - upvoteReport = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}