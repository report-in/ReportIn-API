import { string } from "joi"
import { IPersonRole } from "../../models/person.model"

export type ILoginCampusResponse = {
  id: string,
  campusId: string,
  name: string,
  email: string,
  role: IPersonRole[]
}

export type IGetPersonResponse = {
  id: string,
  campusId: string,
  name: string,
  role: IPersonRole[],
  email: string,
  createdBy: string,
  createdDate: string,
  lastUpdatedBy: string,
  lastUpdatedDate: string
}

export type IGetPersonRoleResponse = {
  role: IPersonRole[]
}