import { Response } from 'express';
import { IMeta, IResponse } from "../types/response/response.interface";

export const sendResponse = (
  res: Response,
  status: boolean,
  statusCode: number,
  message: string,
  data: any = null,
  meta?: IMeta
) => {
  const response: IResponse = {
    status,
    statusCode,
    message,
    data,
    meta
  };
  return res.status(statusCode).send(response);
};