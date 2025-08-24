import { IPersonRole } from "../../models/person.model"

export type ILoginCampus = {
  campusId: string,
  token: string
}

export type IGetAllPerson = {
  campusId: string,
}

export type IUpdatePersonRole = {
  personId: string,
  campusId: string,
  role: IPersonRole[]
}

export type IUpdatePersonStatus = {
  personId: string,
  campusId: string,
  status: boolean
}