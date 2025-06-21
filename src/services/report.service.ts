import { db } from "../config/firebase";
import { IReport } from "../models/report.model";
import { logger } from "../utils/logger";

export const createReportByCampusId = async (report: IReport): Promise<void> => {
  try {
    await db.collection('Report').doc(report.id).set(report);
    logger.info(`Report created = ${report.id} - ${report.description}`);
  } catch (error) {
    logger.error(`ERR: registerUser() = ${error}`)
    throw error;
  }
}