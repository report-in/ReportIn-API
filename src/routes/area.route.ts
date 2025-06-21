import { Router } from 'express';
import { getAllArea } from '../controllers/area.controller';

export const AreaRouter: Router = Router();

AreaRouter.get('/', getAllArea);