import { Request, Response } from "express";
import { getLeaderboardPersonValidation } from "../validations/leaderboard.validation";
import { logger } from "../utils/logger";
import { sendResponse } from "../utils/send-response";
import { getLeaderboardByCampusId } from "../services/leaderboard.service";

export const getLeaderboardPerson = async (req: Request, res: Response) => {
  const { error, value } = getLeaderboardPersonValidation(req.body);

  if (error) {
    logger.error(`ERR: leaderboard - getLeaderboardPerson = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    const leaderboard = await getLeaderboardByCampusId(value.campusId);

    return sendResponse(res, true, 200, 'Get Leaderboard Person Success', leaderboard);
  } catch (err: any) {
    logger.error(`ERR: leaderboard - getLeaderboardPerson = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};