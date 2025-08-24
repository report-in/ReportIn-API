import { Router } from 'express';
import { deleteArea, getAllArea, updateArea, createArea } from '../controllers/area.controller';


export const AreaRouter: Router = Router();

AreaRouter.get('/', getAllArea);
AreaRouter.post('/', createArea);
AreaRouter.put('/', updateArea);
AreaRouter.delete('/', deleteArea);