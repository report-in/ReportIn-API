import Joi from 'joi';
import { IGetAllAreaForm } from '../types/request/area.request';

export const getAllAreaValidation = (payload: IGetAllAreaForm) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
  });

  return schema.validate(payload);
};