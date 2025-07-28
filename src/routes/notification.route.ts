import { Router } from 'express';
import { createNotification } from '../controllers/notification.controller';

export const NotificationRouter: Router = Router();

NotificationRouter.post('/', createNotification);