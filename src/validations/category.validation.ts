import Joi from "joi";

export const getAllCategoryValidation = (data: any) => {

  const schema = Joi.object({
    campusId: Joi.string().required()
  });


  return schema.validate(data);
}