import { IAccess } from "./access.model";

export type IUserRole = {
  roleId: string,
  roleName: string,
  isDefault: boolean
};

export type IUser = {
  id: string,
  role: IUserRole[],
  name: string,
  email: string,
} & IAccess;