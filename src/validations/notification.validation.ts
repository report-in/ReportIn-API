import Joi from 'joi';
import { IReportForm } from '../types/request/report.request';
import { ICreateNotificationForm } from '../types/request/notification.request';

export const createNotificationValidation = (payload: ICreateNotificationForm) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
    personId: Joi.string().required(),
    token: Joi.string().required(),
  });

  return schema.validate(payload);
};