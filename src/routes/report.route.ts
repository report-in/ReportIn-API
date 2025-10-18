import { Router } from 'express';
import { imageUplouder } from '../utils/uplouder';
import { createReport, deleteReport, exportExcelReport, updateReport, updateReportStatus } from '../controllers/report.controller';

export const ReportRouter: Router = Router();

ReportRouter.post('/', imageUplouder.single('image'), createReport);
ReportRouter.put('/:id',imageUplouder.single('image'), updateReport);
ReportRouter.delete('/:id', deleteReport);
ReportRouter.post('/status/:id', updateReportStatus); 
ReportRouter.post('/export', exportExcelReport);