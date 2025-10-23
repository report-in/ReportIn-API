import { IAccess } from "./access.model";
import { IPersonRole } from "./person.model";

export type ITechnicianPreference = {
  id: string,
  personId: string,
  campusId: string,
  categoryId: string
} & IAccess;