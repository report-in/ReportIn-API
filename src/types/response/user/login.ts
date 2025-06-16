import { IRole } from "../../../models/user.model";

export type LoginResponse = {
  id: string,
  name: string,
  email: string,
  role: IRole[],
}