import Joi from "joi";
import { ICampusForm, IUpdateCampusForm } from "../types/request/campus.request";
import { IGetCampusDetailResponse } from "../types/response/campus.response";

export const createCampusValidation = (payload: ICampusForm) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    name: Joi.string().required(),
    mandatoryEmail: Joi.array().items(Joi.string()).required(),
    siteName: Joi.string().required(),
    provider: Joi.string().required(),
    customization: Joi.object({
      primaryColor: Joi.string().required(),
    })
  });

  return schema.validate(payload);
};

export const updateCampusValidation = (payload: IUpdateCampusForm) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    name: Joi.string().required(),
    mandatoryEmail: Joi.array().items(Joi.string()).required(),
    siteName: Joi.string().required(),
    provider: Joi.string().required(),
    customization: Joi.object({
      customizationId: Joi.string().required(),
      primaryColor: Joi.string().required(),
    })
  });

  return schema.validate(payload);
};

export const verificationCampusValidation = (payload: string) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    campusId:Joi.string().required(),
    status: Joi.string().required(),
    comment: Joi.string().required(),
  });

  return schema.validate(payload);
};

export const getSubdomainValidation = (payload: string) => {
  const schema = Joi.object({
    subdomain: Joi.string().required(),
  });

  return schema.validate(payload);
};
