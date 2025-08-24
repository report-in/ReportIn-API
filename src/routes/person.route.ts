import { Router } from 'express';
import { getAllPerson, login, updatePersonRole, updatePersonStatus } from '../controllers/person.controller';

export const PersonRouter: Router = Router();

PersonRouter.post('/', login);
PersonRouter.get('/', getAllPerson);
PersonRouter.post('/UpdatePersonRole', updatePersonRole);
PersonRouter.post('/UpdatePersonStatus', updatePersonStatus);
