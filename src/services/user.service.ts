import { db } from '../config/firebase';
import { IUser } from '../models/user.model';
import { ILoginResponse } from '../types/response/user.response';
import { logger } from '../utils/logger';

export const getUserByEmail = async (email: string): Promise<ILoginResponse | null> => {
  try {
    const usersRef = db.collection('User');
    const querySnapshot = await usersRef.where('email', '==', email).limit(1).get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    const user: ILoginResponse = {
      id: doc.id,
      name: data.name,
      email: data.email,
      role: data.role,
    };

    return user;
  } catch (error) {
    logger.error(`ERR: getUserByEmail() = ${error}`)
    throw error;
  }
};

export const registerUser = async (user: IUser): Promise<ILoginResponse | null> => {
  try {
    await db.collection('User').doc(user.id).set(user);
    logger.info(`User Registered = ${user.id} - ${user.name} - ${user.email}`);

    const response: ILoginResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return response;
  } catch (error) {
    logger.error(`ERR: registerUser() = ${error}`)
    throw error;
  }
}
