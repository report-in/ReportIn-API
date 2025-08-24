import Joi from 'joi';
import { IGetAllAreaForm, IUpdateAreaForm } from '../types/request/area.request';
import { IAreaForm } from '../types/request/area.request';

export const getAllAreaValidation = (payload: IGetAllAreaForm) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
  });

  return schema.validate(payload);
};

export const createAreaValidation = (payload: IAreaForm) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
    beaconId: Joi.string(),
    areaName: Joi.string().required(),
    createdBy: Joi.string().required(),
  });

  return schema.validate(payload);
};

export const updateAreaValidation = (payload: IUpdateAreaForm) => {
  const schema = Joi.object({
    id: Joi.string().required(),
    campusId: Joi.string().required(),
    beaconId: Joi.string(),
    areaName: Joi.string().required(),
  });

  return schema.validate(payload);
};

export const deleteAreaValidation = (payload: string) => {
  const schema = Joi.object({
    id: Joi.string().required(),
  });

  return schema.validate(payload);
};