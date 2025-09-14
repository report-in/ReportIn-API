import { IAccess } from "./access.model";

export type ICampus = {
  id: string, 
  userId: string,
  name: string,
  mandatoryEmail: string[],
  siteName: string,
  document: string[],
  status: string,
  comment: string,
  provider: string,
}&IAccess