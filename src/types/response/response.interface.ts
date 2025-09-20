export type IMeta = {
  totalItems: number,
  page: number,
  pageSize: number,
  totalPages: number
}

export type IResponse = {
  status: boolean,
  statusCode: number,
  message: string,
  data: object | Array<object> | null
  meta?: IMeta
};