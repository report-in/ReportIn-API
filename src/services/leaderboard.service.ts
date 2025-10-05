import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { IGetLeaderboardResponse } from "../types/response/leaderboard.response";
import { logger } from "../utils/logger";
import { getWIBDate } from "../utils/wib-date";
import { ILeaderboard } from "../models/leaderboard.model";

export const getLeaderboardByCampusId = async (campusId: string): Promise<IGetLeaderboardResponse[] | null> => {
  try {
    const leaderboardRef = db.collection('Leaderboard');
    const querySnapshot = await leaderboardRef.where('campusId', '==', campusId).where('isDeleted', '==', false).orderBy('point', 'desc').get();

    if (querySnapshot.empty) {
      return null;
    }

    const leaderboard: IGetLeaderboardResponse[] = [];

    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();

      leaderboard.push({
        name: data.person.name,
        email: data.person.email,
        point: data.point
      });
    });

    return leaderboard;
  } catch (error) {
    logger.error(`ERR: getLeaderboardByCampusId() = ${error}`)
    throw error;
  }
};

export const LEADERBOARD_COLLECTION = ("Leaderboard");

export const getLeaderboardByPersonId = async (personId: string, campusId: string) => {
  const snapshot = await db
    .collection(LEADERBOARD_COLLECTION)
    .where("personId", "==", personId)
    .where("campusId", "==", campusId)
    .get();

  if (snapshot.empty) return null;

  return snapshot.docs[0]; // ambil dokumen pertama
};

export const updateLeaderboardStatus = async (
  leaderboardId: string,
  isDeleted: boolean,
  username: string
) => {
  const docRef = db.collection(LEADERBOARD_COLLECTION).doc(leaderboardId);
  await docRef.update({
    isDeleted,
    lastUpdatedBy: username,
    lastUpdatedDate: getWIBDate(),
  });
};

export const createLeaderboard = async (
  personId: string,
  campusId: string,
  name: string,
  email: string
) => {
  const docRef = db.collection(LEADERBOARD_COLLECTION).doc();

  const newLeaderboard: ILeaderboard = {
    id: docRef.id,
    person: {
      personId,
      name,
      email
    },
    campusId,
    point: 0, // default poin awal
    isDefault: false, // sesuai kebutuhan kamu
    isDeleted: false,
    createdBy: name,
    createdDate: getWIBDate(),
    lastUpdatedBy: name,
    lastUpdatedDate: getWIBDate()
  };

  await docRef.set(newLeaderboard);
  return docRef.id;
};
