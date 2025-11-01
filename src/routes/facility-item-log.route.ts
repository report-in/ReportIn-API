import { Router } from 'express';
import { createFacilityItem, deleteFacilityItem, getAllFacilityItem, updateFacilityItem } from '../controllers/facility-item.controller';
import { getAllFacilityItemLog } from '../controllers/facility-item-log.controller';


export const FacilityItemLogRouter: Router = Router();

FacilityItemLogRouter.get('/all', getAllFacilityItemLog);