import { Router } from 'express';
import { getLeaderboardByCampusId } from '../services/leaderboard.service';

export const LeaderboardRouter: Router = Router();

LeaderboardRouter.get('/', getLeaderboardByCampusId);