import Joi from 'joi';
import { IUpsertTechnicianPreference } from '../types/request/technician-preference.request';

export const technicianPreferenceValidation = (payload: IUpsertTechnicianPreference) => {
  const schema = Joi.object({
    preferences: Joi.array().items(
      Joi.object({
        personId: Joi.string().required(),
        campusId: Joi.string().required(),
        categoryId: Joi.string().required(),
      })
    ).required()
  });

  return schema.validate(payload);
};