import Joi from 'joi';
import { IExportExcelReport, IReportForm, IUpdateStatusReport, IUpvoteReport } from '../types/request/report.request';

export const createReportValidation = (payload: IReportForm) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
    complainantId: Joi.string().required(),
    complainantName: Joi.string().required(),
    complainantEmail: Joi.string().required(),
    areaId: Joi.string().required(),
    areaName: Joi.string().required(),
    categoryId: Joi.string().required(),
    categoryName: Joi.string().required(),
    description: Joi.string().required(),
  });

  return schema.validate(payload);
};

export const updateReportValidation = (payload: IReportForm) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
    complainantId: Joi.string().required(),
    complainantName: Joi.string().required(),
    complainantEmail: Joi.string().required(),
    areaId: Joi.string().required(),
    areaName: Joi.string().required(),
    categoryId: Joi.string().required(),
    categoryName: Joi.string().required(),
    description: Joi.string().required(),
  });

  return schema.validate(payload);
};

export const updateReportStatusValidation = (payload: IUpdateStatusReport) => {
  const schema = Joi.object({
    custodianId: Joi.string().required(),
    campusId: Joi.string().required(),
    status: Joi.string().required(),
  });

  return schema.validate(payload);
};

export const exportExcelReportValidation = (payload: IExportExcelReport) => {
  const schema = Joi.object({
    startDate: Joi.string().required(),
    endDate: Joi.string().required(),
    campusId: Joi.string().required()
  });

  return schema.validate(payload);
}

export const upvoteReportValidation = (payload: IUpvoteReport) => {
  const schema = Joi.object({
    reportId: Joi.string().required(),
    personId: Joi.string().required(),
  });

  return schema.validate(payload);
}

export const deleteReportValidation = (payload: { deletionRemark: string }) => {
  const schema = Joi.object({
    deletionRemark: Joi.string().required(),
  });

  return schema.validate(payload);
}