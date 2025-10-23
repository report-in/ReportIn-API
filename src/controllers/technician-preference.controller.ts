import { logger } from "../utils/logger";
import { Request, Response } from 'express';
import { sendResponse } from "../utils/send-response";
import { technicianPreferenceValidation } from "../validations/technician-preference.validation";
import { Preference } from "../types/request/technician-preference.request";
import { createTechnicianPreferenceService, deleteTechnicianPreferenceBasedOnPreference, getAllTechnicianPreferenceBasedOnPersonIdAndCampusId } from "../services/technician-preference.service";
import { ITechnicianPreference } from "../models/technician-preference.model";
import { generateUID } from "../utils/generate-uid";
import { getUsername } from "../utils/header";
import { getWIBDate } from "../utils/wib-date";
import { ca } from "date-fns/locale";

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

export const getAllTechnicianPreference = async (req: Request, res: Response) => {
  const { campusId, personId } = req.query;

  if (!campusId || !personId) {
    logger.error(`ERR: technicianPreference - getAllTechnicianPreference = Campus Id and Person Id are required`);
    return sendResponse(res, false, 422, 'campusId and personId are required');
  }

  try {
    const technicianPreference = await getAllTechnicianPreferenceBasedOnPersonIdAndCampusId(personId as string, campusId as string);
    return sendResponse(res, true, 200, 'Success get all technician preferences', technicianPreference);
  } catch (err: any) {
    logger.error(`ERR: technicianPreference - getAllTechnicianPreference = ${err}`);
    return sendResponse(res, false, 500, 'Failed to get technician preferences');
  }
}