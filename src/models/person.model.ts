import { IAccess } from "./access.model";

export type IPersonRole = {
  roleId: string,
  roleName: string,
  isDefault: boolean
};

export type IPerson = {
  id: string,
  campusId: string,
  role: IPersonRole[],
  name: string,
  email: string,
  status: boolean
} & IAccess;