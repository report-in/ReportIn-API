import { Router } from 'express';
import { getRoute } from '../controllers/route.controller';

export const RouteRouter: Router = Router();

RouteRouter.get('/', getRoute);