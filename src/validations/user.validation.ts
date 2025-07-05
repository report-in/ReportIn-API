import Joi from 'joi';
import { ILogin } from '../types/request/user.request';

export const userLoginValidation = (payload: ILogin) => {
  const schema = Joi.object({
    token: Joi.string().required(),
  });

  return schema.validate(payload);
};