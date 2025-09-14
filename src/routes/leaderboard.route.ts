import { Router } from 'express';
import { getLeaderboardByCampusId } from '../services/leaderboard.service';
import { getLeaderboardPerson } from '../controllers/leaderboard.controller';

export const LeaderboardRouter: Router = Router();

LeaderboardRouter.get('/:campusId', getLeaderboardPerson);