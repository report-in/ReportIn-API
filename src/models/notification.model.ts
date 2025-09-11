import { IAccess } from "./access.model";

export type INotification = {
  id: string,
  token: string,
  campusId: string,
  personId: string,
} & IAccess;