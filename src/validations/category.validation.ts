import Joi from "joi";

export const getAllCategoryValidation = (data: any) => {

  const schema = Joi.object({
    campusId: Joi.string().required()
  });


  return schema.validate(data);
}

export const createCategoryValidation = (data: any) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
    name: Joi.string().required(),
    estimationCompletionValue: Joi.string().required(),
    estimationCompletionUnit: Joi.string().required(),
  });

  return schema.validate(data);
};

export const updateCategoryValidation = (data: any) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
    name: Joi.string().required(),
    estimationCompletionValue: Joi.number().required(),
    estimationCompletionUnit: Joi.string().required(),
  });

  return schema.validate(data);
};

export const deleteCategoryValidation = (data: any) => {
  const schema = Joi.object({
    id: Joi.string().required(),
  });

  return schema.validate(data);
};
