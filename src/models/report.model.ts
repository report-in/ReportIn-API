import { IAccess } from "./access.model";

export type IPersonReport = {
  personId: string,
  name: string,
  email: string
}

export type IAreaReport = {
  areaId: string,
  name: string
}

export type ICategoryReport = {
  categoryId: string,
  name: string
}

export type IReport = {
  id: string,
  complainant: IPersonReport[],
  custodian?: IPersonReport,
  area: IAreaReport,
  category: ICategoryReport,
  campusId: string,
  description: string[],
  image: string[],
  status: string,
  count: number,
  deletionRemark?: string,
  completionDate?: string,
} & IAccess;