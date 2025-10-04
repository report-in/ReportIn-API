import { Router } from 'express';
import { createCampus, deleteCampus, getAllCampus, getAllCampusByUserId, getCampusDetail, getSubdomain, updateCampus, verificationCampus } from '../controllers/campus.controller';
import { campusUploader, documentUplouder } from '../utils/uplouder';
import { parseJsonFields } from '../utils/parseStringtoJSON';


export const CampusRouter: Router = Router();

CampusRouter.get('/all', getAllCampus);
CampusRouter.get('/all/:userId', getAllCampusByUserId)
CampusRouter.post(
  '/',
  campusUploader.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'document', maxCount: 5 }
  ]),
  parseJsonFields(['mandatoryEmail', 'customization']),
  createCampus
);
CampusRouter.post('/verify', verificationCampus);
CampusRouter.post('/subdomain', getSubdomain);
CampusRouter.get('/:id', getCampusDetail);
CampusRouter.delete('/:id', deleteCampus);
CampusRouter.post(
  '/:id',
  campusUploader.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'document', maxCount: 5 }
  ]),
  parseJsonFields(['mandatoryEmail', 'customization']),
  updateCampus
);