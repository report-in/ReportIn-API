import { Router } from 'express';
import { getAllPerson, login, updateDefaultPersonRole, updatePersonRole, updatePersonStatus } from '../controllers/person.controller';

export const PersonRouter: Router = Router();

PersonRouter.post('/', login);
PersonRouter.post('/all', getAllPerson);
PersonRouter.post('/role/:id', updatePersonRole);
PersonRouter.post('/status/:id', updatePersonStatus);
PersonRouter.put("/:id/default-role", updateDefaultPersonRole);