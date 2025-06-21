import { IUserRole } from "../../models/user.model";

export type ILoginResponse = {
  id: string,
  name: string,
  email: string,
  role: IUserRole[],
}