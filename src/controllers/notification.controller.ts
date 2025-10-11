import { Request, Response } from "express";
import { admin } from "../config/firebase";
import { createNotificationToken, getAllCustodianFcmTokens, getReportPersonFcmTokens } from "../services/notification.service";
import { logger } from "../utils/logger";
import { sendResponse } from "../utils/send-response";
import { createNotificationValidation } from "../validations/notification.validation";
import { INotification } from "../models/notification.model";
import { generateUID } from "../utils/generate-uid";
import { getWIBDate } from "../utils/wib-date";
import { getUsername } from "../utils/header";
import { getReportById } from "../services/report.service";

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

export const sendNotification = async (
  campusId: string,
  message: string,
  image: string
): Promise<void> => {
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
      },
      android: {
        notification: { imageUrl: image },
      },
      webpush: {
        notification: { image },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(payload);

    logger.info(`FCM sendEachForMulticast: Success=${response.successCount}, Failure=${response.failureCount}`);
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        logger.error(`Token ${tokens[idx]} failed: ${resp.error?.message}`);
      }
    });

  } catch (err: any) {
    logger.error(`sendNotification failed: ${JSON.stringify(err, null, 2)}`);
  }
};

export const sendNotificationReportStatus = async (reportId: string, status: string): Promise<void> => {
  try {
    logger.info(`sendNotification started with reportId=${reportId}`);

    // Ambil data setiap person beserta tokennya
    const personsData = await getReportPersonFcmTokens(reportId);

    if (!personsData || personsData.length === 0) {
      logger.warn('No person FCM data found. Stopping notification process.');
      return;
    }

    // Loop tiap person untuk kirim pesan berbeda
    for (const person of personsData) {
      const { tokens, description, image } = person;

      if (!tokens || tokens.length === 0) {
        logger.warn(`No tokens found for person with description "${description}". Skipping.`);
        continue;
      }

      logger.info(`Preparing FCM payload for ${tokens.length} tokens of person "${description}".`);

      const payload: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: `Status Report Alert - ${status}`,
          body: description || 'You have a new report update!',
        },
        android: {
          notification: { imageUrl: image },
        },
        webpush: {
          notification: { image },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(payload);

      logger.info(
        `✅ Sent to person "${description}": Success=${response.successCount}, Failure=${response.failureCount}`
      );

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          logger.error(`❌ Token ${tokens[idx]} failed: ${resp.error?.message}`);
        }
      });
    }
  } catch (err: any) {
    logger.error(`sendNotificationReportStatus failed: ${JSON.stringify(err, null, 2)}`);
  }
};
