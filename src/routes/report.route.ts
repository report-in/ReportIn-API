import { Router } from 'express';
import { imageUplouder } from '../utils/uplouder';
import { createReport } from '../controllers/report.controller';

export const ReportRouter: Router = Router();

ReportRouter.post('/', imageUplouder.single('image'), createReport);