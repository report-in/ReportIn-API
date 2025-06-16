export type IResponse = {
  status: boolean,
  statusCode: number,
  message: string,
  data: object | Array<object> | null
};