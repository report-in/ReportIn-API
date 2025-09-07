import { Router } from 'express';
import { getAllPerson, login, updatePersonRole, updatePersonStatus } from '../controllers/person.controller';

export const PersonRouter: Router = Router();

PersonRouter.post('/', login);
PersonRouter.post('/all', getAllPerson);
PersonRouter.post('/role', updatePersonRole);
PersonRouter.post('/status', updatePersonStatus);
