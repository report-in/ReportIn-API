import { Router } from 'express';
import { getAllPerson, login, updatePersonRole, updatePersonStatus } from '../controllers/person.controller';

export const PersonRouter: Router = Router();

PersonRouter.post('/', login);
PersonRouter.post('/all/:campusId', getAllPerson);
PersonRouter.post('/role/:id', updatePersonRole);
PersonRouter.post('/status/:id', updatePersonStatus);
