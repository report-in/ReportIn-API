import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { IGetLeaderboardResponse } from "../types/response/leaderboard.response";
import { logger } from "../utils/logger";

export const getLeaderboardByCampusId = async (campusId: string): Promise<IGetLeaderboardResponse[] | null> => {
  try {
    const leaderboardRef = db.collection('Leaderboard');
    const querySnapshot = await leaderboardRef.where('campusId', '==', campusId).where('isDeleted', '==', false).get();

    if (querySnapshot.empty) {
      return null;
    }

    const leaderboard: IGetLeaderboardResponse[] = [];

    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();

      leaderboard.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        point: data.point
      });
    });

    return leaderboard;
  } catch (error) {
    logger.error(`ERR: getLeaderboardByCampusId() = ${error}`)
    throw error;
  }
};
