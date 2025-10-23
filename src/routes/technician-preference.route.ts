import { Router } from 'express';
import { createTechnicianPreference, getAllTechnicianPreference } from '../controllers/technician-preference.controller';

export const TechnicianPreferenceRouter: Router = Router();

TechnicianPreferenceRouter.post('/', createTechnicianPreference);
TechnicianPreferenceRouter.get('/', getAllTechnicianPreference);