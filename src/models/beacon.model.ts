import { IAccess } from "./access.model";

export type IBeacon = {
  id: string,
  campusId: string,
} & IAccess;