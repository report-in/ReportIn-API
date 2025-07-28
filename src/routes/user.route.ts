import { Router } from 'express';
import { login } from '../controllers/user.controller';

export const UserRouter: Router = Router();

UserRouter.post('/', login);