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

export const sendNotification = (
  message: string,
  image: string
): void => {
  (async () => {
    try {
      const tokens = await getAllCustodianFcmTokens();

      if (!tokens || tokens.length === 0) {
        logger.warn('No FCM tokens found for custodians.');
        return;
      }

      const payload: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: 'New Report Alert',
          body: message,
          imageUrl: image
        },
      };

      const response = await admin.messaging().sendEachForMulticast(payload);

      logger.info(
        `FCM sent to ${tokens.length} tokens. Success: ${response.successCount}, Failure: ${response.failureCount}`
      );

      if (response.failureCount > 0) {
        response.responses.forEach((resp: any, idx: number) => {
          if (!resp.success) {
            logger.warn(
              `Failed to send to token[${idx}]: ${tokens[idx]} — ${resp.error?.message}`
            );
          }
        });
      }
    } catch (err: any) {
      logger.error(`sendNotification failed: ${err.message || err}`);
    }
  })(); // immediately-invoked async function expression (IIFE)
};