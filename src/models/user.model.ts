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
  isDeleted: boolean,
  createdDate: string,
  createdBy: string,
  lastUpdatedDate: string,
  lastUpdatedBy: string
};