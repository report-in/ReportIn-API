import { IAccess } from "./access.model";

export type ILeaderboardPerson = {
  personId: string,
  name: string,
  email: string
};

export type ILeaderboard = {
  id: string,
  person: ILeaderboardPerson,
  campusId: string,
  point: number,
  isDefault: boolean
}&IAccess