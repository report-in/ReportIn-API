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
    areaName: Joi.string().required(),
    beaconId: Joi.string().allow(null, '')
  });

  return schema.validate(payload);
};

export const updateAreaValidation = (payload: IUpdateAreaForm) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
    areaName: Joi.string().required(),
    beaconId: Joi.string().allow(null, '')
  });

  return schema.validate(payload);
};