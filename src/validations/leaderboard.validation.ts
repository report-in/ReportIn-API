import Joi from "joi";
import { IGetLeaderboardResponse } from "../types/response/leaderboard.response";

export const getLeaderboardPersonValidation = (payload: IGetLeaderboardResponse) => {
  const schema = Joi.object({
    campusId: Joi.string().required(),
  })
  return schema.validate(payload);
}