import Joi from 'joi';
import { IReportForm } from '../types/request/report.request';
import { ICreateNotificationForm, ISendNotificationForm } from '../types/request/notification.request';

export const createNotificationValidation = (payload: ICreateNotificationForm) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
    personId: Joi.string().required(),
    token: Joi.string().required(),
  });

  return schema.validate(payload);
};

export const sendNotificationValidation = (payload: ISendNotificationForm) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
    message: Joi.string().required(),
    image: Joi.string().required(),
  });

  return schema.validate(payload);
};