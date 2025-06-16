import { Response } from 'express';
import { IResponse } from "../types/response/response.interface";

export const sendResponse = (
  res: Response,
  status: boolean,
  statusCode: number,
  message: string,
  data: any = null
) => {
  const response: IResponse = {
    status,
    statusCode,
    message,
    data
  };
  return res.status(statusCode).send(response);
};