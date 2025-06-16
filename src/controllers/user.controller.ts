import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { userLoginValidation } from '../validations/user.validation';
import { IResponse } from '../types/response/response.interface';
import { admin } from '../config/firebase';
import { IRole, IUser } from '../models/user.model';
import { getWIBDate } from '../utils/wib-date';
import { getUserByEmail, registerUser } from '../services/user.service';
import { generateUID } from '../utils/generate-uid';
import { sendResponse } from '../utils/send-response';

export const login = async (req: Request, res: Response) => {
  const { error, value } = userLoginValidation(req.body);

  if (error) {
    logger.error(`ERR: user - login = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    const auth = await admin.auth().verifyIdToken(value.token);
    const { email, name, user_id } = auth;

    let user = await getUserByEmail(email);

    if (!user) {
      const role: IRole = {
        roleId: generateUID(),
        roleName: 'Administrator University',
        isDefault: true
      }

      const newUser: IUser = {
        id: user_id,
        role: [role],
        name: name,
        email: email,
        isDeleted: false,
        createdDate: getWIBDate(),
        createdBy: 'SYSTEM',
        lastUpdatedDate: getWIBDate(),
        lastUpdatedBy: 'SYSTEM'
      }

      user = await registerUser(newUser);
    }

    return sendResponse(res, true, 200, 'Login Success', user);
  } catch (err: any) {
    logger.error(`ERR: user - login = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};