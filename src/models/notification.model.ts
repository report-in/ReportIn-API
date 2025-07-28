import { IAccess } from "./access.model";

export type INotification = {
  id: string,
  token: string,
  personId: string,
} & IAccess;