import { Router } from 'express';
import { createNotification, sendNotification } from '../controllers/notification.controller';

export const NotificationRouter: Router = Router();

NotificationRouter.post('/', createNotification);
NotificationRouter.post('/send', sendNotification);