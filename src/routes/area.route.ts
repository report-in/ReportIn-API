import { Router } from 'express';
import { deleteArea, getAllArea, updateArea, createArea } from '../controllers/area.controller';


export const AreaRouter: Router = Router();

AreaRouter.get('/all', getAllArea);
AreaRouter.post('/', createArea);
AreaRouter.put('/:id', updateArea);
AreaRouter.delete('/:id', deleteArea);