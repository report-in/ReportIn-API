import { Request, Response } from "express";
import { admin } from "../config/firebase";
import { IPerson, IPersonRole } from "../models/person.model";
import { logger } from "../utils/logger";
import { sendResponse } from "../utils/send-response";
import { getWIBDate } from "../utils/wib-date";
import { getAllPersonValidation, personLoginValidation, updatePersonRoleValidation, updatePersonStatusValidation } from "../validations/person.validation";
import { getAllPersonByCampusId, getPersonByEmailandCampusId, getPersonByPersonIdandCampusId, registerPerson, updatePersonRoleByPersonId, updatePersonStatusByPersonId } from "../services/person.service";

export const login = async (req: Request, res: Response) => {
  const { error, value } = personLoginValidation(req.body);

  if (error) {
    logger.error(`ERR: person - login = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    // ini baru ngambil token google, microsoft belom
    const auth = await admin.auth().verifyIdToken(value.token);
    const { email, name, user_id } = auth;

    let person = await getPersonByEmailandCampusId(email, value.campusId);

    if (!person && email) {
      const role: IPersonRole = {
        roleId: "gNTymOZbhsyxJ5pmO5VX",
        roleName: 'Complainant',
        isDefault: true
      }

      const newPerson: IPerson = {
        id: user_id,
        campusId: value.campusId,
        role: [role],
        name: name,
        email: email,
        status: false,
        isDeleted: false,
        createdDate: getWIBDate(),
        createdBy: 'SYSTEM',
        lastUpdatedDate: getWIBDate(),
        lastUpdatedBy: 'SYSTEM'
      }

      person = await registerPerson(newPerson);
    }

    return sendResponse(res, true, 200, 'Login Success', person);
  } catch (err: any) {
    logger.error(`ERR: person - login = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};

export const getAllPerson = async (req: Request, res: Response) => {
  const { error, value } = getAllPersonValidation(req.body);

  if (error) {
    logger.error(`ERR: person - getAllPerson = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    const areas = await getAllPersonByCampusId(value.campusId);

    return sendResponse(res, true, 200, 'Get All Person Success', areas);
  } catch (err: any) {
    logger.error(`ERR: person - getAllPerson = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};

export const updatePersonRole = async (req: Request, res: Response) => {
  const { error, value } = updatePersonRoleValidation(req.body);

  if (error) {
    logger.error(`ERR: person - Update Person Role = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    const { personId, campusId, role } = value;

    const currentPerson = await getPersonByPersonIdandCampusId(personId, campusId);
    const defaultRole = currentPerson?.role.find((r: any) => r.isDefault === true);

    //cari role default current apa (idnya), trus liat role to benya apa ada idnya
    // kalo gak ada defaultnya pindahin ke array [0] 
    if (role.find((r: any) => r.roleId === defaultRole?.roleId)) {
      await updatePersonRoleByPersonId(personId, role);
    } else {
      role[0].isDefault = true;
      await updatePersonRoleByPersonId(personId, role);
    }

    // habis nimpa liat apakah yg prev role defaultnya ada atau tidak dibaru, 
    // kalo ga ada bikin array [0] isDefault true

    return sendResponse(res, true, 200, "Person updated successfully");
  } catch (err: any) {
    logger.error(`ERR: person - Update Person Role = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};

export const updatePersonStatus = async (req: Request, res: Response) => {
  const { error, value } = updatePersonStatusValidation(req.body);

  if (error) {
    logger.error(`ERR: person - Update Person Status = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }

  try {
    const { personId, campusId, status } = value;

    const currentPerson = await getPersonByPersonIdandCampusId(personId, campusId);

    if (currentPerson?.role.find((r: any) => r.roleName === "Custodian")) {
      await updatePersonStatusByPersonId(personId, status);
    } else {
      return sendResponse(res, false, 422, "You dont have the Custodian Role!")
    }

    return sendResponse(res, true, 200, "Status updated successfully");
  } catch (err: any) {
    logger.error(`ERR: person - Update Person Status = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};