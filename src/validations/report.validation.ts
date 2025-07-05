import Joi from 'joi';
import { IReportForm } from '../types/request/report.request';

export const createReportValidation = (payload: IReportForm) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
    complainantId: Joi.string().required(),
    complainantName: Joi.string().required(),
    complainantEmail: Joi.string().required(),
    custodianId: Joi.string().required(),
    custodianName: Joi.string().required(),
    custodianEmail: Joi.string().required(),
    areaId: Joi.string().required(),
    areaName: Joi.string().required(),
    categoryId: Joi.string().required(),
    categoryName: Joi.string().required(),
    description: Joi.string().required(),
  });

  return schema.validate(payload);
};