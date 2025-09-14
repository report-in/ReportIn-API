import { Request, Response } from "express";
import {  } from "../validations/leaderboard.validation";
import { logger } from "../utils/logger";
import { sendResponse } from "../utils/send-response";
import { getLeaderboardByCampusId } from "../services/leaderboard.service";

export const getLeaderboardPerson = async (req: Request, res: Response) => {
  const {params: {campusId}} = req;
  if (!campusId) {
    logger.error(`ERR: leaderboard - getLeaderboardPerson = Campus Id not found`);
    return sendResponse(res, false, 422, "Campus Id not found");
  }

  try {
    const leaderboard = await getLeaderboardByCampusId(campusId);
    return sendResponse(res, true, 200, 'Get Leaderboard Person Success', leaderboard);
  } catch (err: any) {
    logger.error(`ERR: leaderboard - getLeaderboardPerson = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};