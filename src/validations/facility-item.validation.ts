import Joi from "joi";
import { IFacilityItemForm } from "../types/request/facility-item.request";

export const createFacilityItemValidation = (payload: IFacilityItemForm) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
    areaId: Joi.string().required(),
    name: Joi.string().required(),
  });

  return schema.validate(payload);
};

export const updateFacilityItemValidation = (payload: {name: string}) => {
  const schema = Joi.object({
    name: Joi.string().required(),
  });

  return schema.validate(payload);
};