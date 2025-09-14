import { IPersonRole } from "../../models/person.model"

export type ILoginCampus = {
  campusId: string,
  token: string
}

export type IUpdatePersonRole = {
  campusId: string,
  role: IPersonRole[]
}

export type IUpdatePersonStatus = {
  campusId: string,
  status: boolean
}