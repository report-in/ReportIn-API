import { logger } from "../utils/logger";
import { Request, Response } from 'express';
import { sendResponse } from "../utils/send-response";
import { technicianPreferenceValidation } from "../validations/technician-preference.validation";
import { Preference } from "../types/request/technician-preference.request";
import { createTechnicianPreferenceService, deleteTechnicianPreferenceBasedOnPreference } from "../services/technician-preference.service";
import { ITechnicianPreference } from "../models/technician-preference.model";
import { generateUID } from "../utils/generate-uid";
import { getUsername } from "../utils/header";
import { getWIBDate } from "../utils/wib-date";

export const createTechnicianPreference = async (req: Request, res: Response) => {
  const { error, value } = technicianPreferenceValidation(req.body);

  if (error) {
    logger.error(`ERR: notification - create = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    await Promise.all(
      value.preferences.map(async (preference: Preference) => {
        await deleteTechnicianPreferenceBasedOnPreference(preference);
        const technicianPreference: ITechnicianPreference = {
          id: generateUID(),
          personId: preference.personId,
          campusId: preference.campusId,
          categoryId: preference.categoryId,
          isDeleted: false,
          createdBy: getUsername(req),
          createdDate: getWIBDate(),
          lastUpdatedBy: getUsername(req),
          lastUpdatedDate: getWIBDate()
        };
        await createTechnicianPreferenceService(technicianPreference);
      })
    );

    return sendResponse(res, true, 200, 'Technician preferences updated successfully');
  } catch (err: any) {
    logger.error(`ERR: technician preference - upsert = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
}