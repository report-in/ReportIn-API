import { db } from '../config/firebase';
import { IUser } from '../models/user.model';
import { LoginResponse } from '../types/response/user/login';
import { logger } from '../utils/logger';

export const getUserByEmail = async (email: string): Promise<LoginResponse | null> => {
  try {
    const usersRef = db.collection('User');
    const querySnapshot = await usersRef.where('email', '==', email).limit(1).get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    const user: LoginResponse = {
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

export const registerUser = async (user: IUser): Promise<LoginResponse | null> => {
  try {
    await db.collection('User').doc(user.id).set(user);
    logger.info(`User Registered = ${user.id} - ${user.name} - ${user.email}`);

    const response: LoginResponse = {
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
