import { Request, Response } from "express";
import { admin } from "../config/firebase";
import { createNotificationToken, getAllCustodianFcmTokens } from "../services/notification.service";
import { logger } from "../utils/logger";
import { sendResponse } from "../utils/send-response";
import { createNotificationValidation } from "../validations/notification.validation";
import { INotification } from "../models/notification.model";
import { generateUID } from "../utils/generate-uid";
import { getWIBDate } from "../utils/wib-date";
import { getUsername } from "../utils/header";

export const createNotification = async (req: Request, res: Response) => {
  const { error, value } = createNotificationValidation(req.body);

  if (error) {
    logger.error(`ERR: notification - create = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    const notification: INotification = {
      id: value.token,
      personId: value.personId,
      campusId: value.campusId,
      token: value.token,
      isDeleted: false,
      createdDate: getWIBDate(),
      createdBy: getUsername(req),
      lastUpdatedDate: getWIBDate(),
      lastUpdatedBy: getUsername(req)
    };

    await createNotificationToken(notification);
    return sendResponse(res, true, 200, 'Notification token created successfully');
  } catch (err: any) {
    logger.error(`ERR: notification - create = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}

export const sendNotification = (campusId: string, message: string, image: string): void => {
  (async () => {
    try {
      logger.info(`sendNotification started with campusId=${campusId}, message=${message}`);

      let tokens: string[] = [];
      try {
        tokens = await getAllCustodianFcmTokens(campusId);
        logger.info(`getAllCustodianFcmTokens returned ${tokens.length} tokens.`);
      } catch (err) {
        logger.error(`getAllCustodianFcmTokens failed: ${JSON.stringify(err, null, 2)}`);
        return;
      }

      if (!tokens || tokens.length === 0) {
        logger.warn('No FCM tokens found for custodians. Stopping notification process.');
        return;
      }

      logger.info(`Preparing FCM payload for ${tokens.length} tokens.`);

      const payload: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: 'New Report Alert',
          body: message,
          imageUrl: image
        },
      };

      const response = await admin.messaging().sendEachForMulticast(payload);
      logger.info(`FCM sendEachForMulticast successful.`);
      logger.info(`FCM response details: ${JSON.stringify(response, null, 2)}`);

    } catch (err: any) {
      logger.error(`sendNotification failed: ${JSON.stringify(err, null, 2)}`);
    }
  })();
};