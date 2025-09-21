import { db } from "../config/firebase";
import { IReport } from "../models/report.model";
import { ISimilarReport } from "../types/request/report.request";
import { logger } from "../utils/logger";

export const createReportByCampusId = async (report: IReport): Promise<void> => {
  try {
    await db.collection('Report').doc(report.id).set(report);
    logger.info(`Report created = ${report.id} - ${report.complainant[0].description}`);
  } catch (error) {
    logger.error(`ERR: registerUser() = ${error}`)
    throw error;
  }
}

export const getAllSimilarReports = async (report: ISimilarReport): Promise<IReport[]> => {
  try {
    const reportsRef = db.collection('Report')
      .where("campusId", "==", report.campusId)
      .where("area.areaId", "==", report.areaId)
      .where("category.categoryId", "==", report.categoryId)
      .where("status", "==", "PENDING")
      .where("isDeleted", "==", false);

    const querySnapshot = await reportsRef.get();
    const reports: IReport[] = querySnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => doc.data() as IReport);

    return reports;
  } catch (error) {
    logger.error(`ERR: getAllSimilarReports() = ${error}`)
    throw error;
  }
}

export const getReportById = async (reportId: string): Promise<IReport | null> => {
  try {
    const reportRef = db.collection('Report').doc(reportId);
    const reportSnapshot = await reportRef.get();

    if (!reportSnapshot.exists) {
      logger.warn(`Report not found: ${reportId}`);
      return null;
    }

    return reportSnapshot.data() as IReport;
  } catch (error) {
    logger.error(`ERR: getReportById() = ${error}`)
    throw error;
  }
}

export const updateReportById = async (report: IReport): Promise<void> => {
  try {
    const reportRef = db.collection('Report').doc(report.id);
    await reportRef.set(report);
  } catch (error) {
    logger.error(`ERR: addSimilarReport() = ${error}`)
    throw error;
  }
}

export const deleteReportByReportId = async (id: string): Promise<void> => {
  try {
    await db.collection('Report').doc(id).update({ isDeleted: true });
    logger.info(`Report deleted = ${id}`);
  } catch (error) {
    logger.error(`ERR: deleteReportByReportId() = ${error}`)
    throw error;
  }
}