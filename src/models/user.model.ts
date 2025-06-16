export type IRole = {
  roleId: string,
  roleName: string,
  isDefault: boolean
};

export type IUser = {
  id: string,
  role: IRole[],
  name: string,
  email: string,
  isDeleted: boolean,
  createdDate: string,
  createdBy: string,
  lastUpdatedDate: string,
  lastUpdatedBy: string
};