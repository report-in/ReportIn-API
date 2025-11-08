import { IAccess } from "./access.model";

export type IPersonReport = {
  personId: string,
  name: string,
  email: string,
  description: string,
  image: string
}

export type IAreaReport = {
  areaId: string,
  name: string
}

export type ICategoryReport = {
  categoryId: string,
  name: string,
  estimationCompletion: string
}

export type IReport = {
  id: string,
  facilityUser: IPersonReport[],
  technician?: IPersonReport,
  area: IAreaReport,
  category: ICategoryReport,
  campusId: string,
  status: string,
  count: number,
  upvote: string[],
  deletionRemark?: string,
  completionDate?: string
} & IAccess;