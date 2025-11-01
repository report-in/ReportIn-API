import { IAccess } from "./access.model";

export type IPersonFacilityItemLog = {
  personId: string,
  name: string,
  email: string,
}

export type IFacilityItemLog ={
  id: string,
  itemId: string,
  issue: string,
  person: IPersonFacilityItemLog
}&IAccess