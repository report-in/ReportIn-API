import { Router } from 'express';
import { createTechnicianPreference } from '../controllers/technician-preference.controller';

export const TechnicianPreferenceRouter: Router = Router();

TechnicianPreferenceRouter.post('/', createTechnicianPreference);