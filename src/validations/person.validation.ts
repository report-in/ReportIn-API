import Joi from "joi";
import { ILoginCampus, IUpdatePersonRole, IUpdatePersonStatus } from "../types/request/person.request";

export const personLoginValidation = (payload: ILoginCampus) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
    token: Joi.string().required(),
  });

  return schema.validate(payload);
};

export const updatePersonRoleValidation = (payload: IUpdatePersonRole) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
    role: Joi.array().items(
      Joi.object({
        roleId: Joi.string().required(),
        roleName: Joi.string().required(),
      })
    ).min(1).required(),
  });
  return schema.validate(payload);
};

export const updatePersonStatusValidation = (payload: IUpdatePersonStatus) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
    status: Joi.boolean().required()
  })
  return schema.validate(payload);
}