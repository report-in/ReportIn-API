import { Router } from 'express';
import { createFacilityItem, deleteFacilityItem, getAllFacilityItem, updateFacilityItem } from '../controllers/facility-item.controller';


export const FacilityItemRouter: Router = Router();

FacilityItemRouter.get('/all', getAllFacilityItem);
FacilityItemRouter.post('/', createFacilityItem);
FacilityItemRouter.put('/:id', updateFacilityItem);
FacilityItemRouter.delete('/:id', deleteFacilityItem);