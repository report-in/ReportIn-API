import { error } from "console";
import ExcelJS from "exceljs";
import { db } from "../config/firebase";
import { IPersonReport, IReport } from "../models/report.model";
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

export const updateReportStatusById = async (id: string, status:string, custodianPerson: IPersonReport, lastUpdatedBy: string, lastUpdatedDate: string): Promise<void> => {
  try {
    await db.collection('Report').doc(id).update({ status, custodian: custodianPerson, lastUpdatedDate: lastUpdatedDate, lastUpdatedBy: lastUpdatedBy });
    logger.info(`Report status updated = ${id} -> ${status}`);
  } catch (error) {
    logger.error(`ERR: updateReportStatusById() = ${error}`)
    throw error;
  }
}

export const exportReportToExcelByCampusId = async (startDate: Date, endDate: Date, campusId: string): Promise<Buffer> => {
  try {
    const snapshotReport = await db
      .collection("Report")
      .where("createdDate", ">=", startDate)
      .where("createdDate", "<=", endDate)
      .where("campusId", "==", campusId)
      .where("isDeleted", "==", false)
      .get();

    if (snapshotReport.empty) {
      logger.error("No report data found in range");
      throw error;
    }

    const reports = snapshotReport.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Reports");

    sheet.columns = [
      { header: "Description", key: "description", width: 30 },
      { header: "Area", key: "area", width: 25 },
      { header: "Category", key: "category", width: 15 },
      { header: "Status", key: "status", width: 30 },
      { header: "Complainant Count", key: "complainantCount", width: 20 },
      { header: "Complainant", key: "ComplainantNames", width: 20},
      { header: "Custodian", key: "CustodianName", width: 20},
      { header: "CreatedDate", key: "CreatedDate", width: 20}, 
    ];

      reports.forEach((r) => {
        const complainants = Array.isArray(r.complainant) ? r.complainant : [];
        const complainantNames = complainants.map((c: any) => c.name).join("; ");
        const complainantDescriptions = complainants
          .map((c: any) => c.description)
          .join("; ");

        sheet.addRow({
          id: r.id,
          area: r.area?.name || "-",
          category: r.category?.name || "-",
          status: r.status || "-",
          createdDate: r.createdDate || "-",
          complainantCount: complainants.length,
          complainantNames: complainantNames || "-",
          descriptions: complainantDescriptions || "-",
        });
      });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
      
  } catch (error) {
    logger.error(`ERR: exportReportToExcelByCampusId() = ${error}`)
    throw error;
  }
}

