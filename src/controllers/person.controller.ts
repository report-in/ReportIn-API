import { Request, Response } from "express";
import { admin } from "../config/firebase";
import { IPerson, IPersonRole } from "../models/person.model";
import { logger } from "../utils/logger";
import { sendResponse } from "../utils/send-response";
import { getWIBDate } from "../utils/wib-date";
import { personLoginValidation, updatePersonRoleValidation, updatePersonStatusValidation } from "../validations/person.validation";
import { getAllPersonByCampusId, getPersonByEmailandCampusId, getPersonByPersonIdandCampusId, registerPerson, updatePersonRoleByPersonId, updatePersonStatusByPersonId } from "../services/person.service";
import { any } from "joi";
import { getUsername } from "../utils/header";

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
  const { params: { campusId } } = req

  if (!campusId) {
    logger.error(`ERR: person - getAllPerson = campus Id not found`);
    return sendResponse(res, false, 422, "Campus Id not found");
  }

  try {
    const persons = await getAllPersonByCampusId(campusId);
    return sendResponse(res, true, 200, 'Get All Person Success', persons);
  } catch (err: any) {
    logger.error(`ERR: person - getAllPerson = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};

export const updatePersonRole = async (req: Request, res: Response) => {
  const { error, value } = updatePersonRoleValidation(req.body);
  const { params: { id } } = req;

  if (error) {
    logger.error(`ERR: person - Update Person Role = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }
  if (!id) {
    logger.error(`ERR: person - Update Person Role = person Id not found`);
    return sendResponse(res, false, 422, "Person Id not found");
  }

  try {
    const { campusId, role } = value;

    const newRoles: IPersonRole[] = role.map((r: IPersonRole, index: number) => ({
      roleId: r.roleId,
      roleName: r.roleName,
      isDefault: index === 0  // isDefault selalu index pertama yaitu complainant
    }));

    await updatePersonRoleByPersonId(id, newRoles, getUsername(req), getWIBDate());
    return sendResponse(res, true, 200, "Person updated successfully");
  } catch (err: any) {
    logger.error(`ERR: person - Update Person Role = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};

export const updatePersonStatus = async (req: Request, res: Response) => {
  const { error, value } = updatePersonStatusValidation(req.body);
  const { params: { id } } = req;

  if (error) {
    logger.error(`ERR: person - Update Person Status = ${error.details[0].message}`);
    return sendResponse(res, false, 422, error.details[0].message);
  }
  if (!id) {
    logger.error(`ERR: person - Update Person Status = person Id not found`);
    return sendResponse(res, false, 422, "Person Id not found");
  }

  try {
    const { campusId, status } = value;
    const currentPerson = await getPersonByPersonIdandCampusId(id, campusId);

    if (currentPerson?.role.find((r: any) => r.roleName === "Custodian")) {
      await updatePersonStatusByPersonId(id, status, getUsername(req), getWIBDate());
    } else {
      return sendResponse(res, false, 422, "You dont have the Custodian Role!")
    }

    return sendResponse(res, true, 200, "Status updated successfully");
  } catch (err: any) {
    logger.error(`ERR: person - Update Person Status = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};

export const updateDefaultPersonRole = async (req: Request, res: Response) => {
  const { params: { id } } = req; // personId dari URL
  const { roleName } = req.body;  // roleName dari body

  if (!id) {
    logger.error(`ERR: person - Update Default Role = person Id not found`);
    return sendResponse(res, false, 422, "Person Id not found");
  }
  
  if (!roleName) {
    logger.error(`ERR: person - Update Default Role = roleName not found`);
    return sendResponse(res, false, 422, "roleName not found");
  }

  try {
    // 1. Ambil person dari DB
    const currentPerson = await getPersonByPersonIdandCampusId(id, req.body.campusId);

    if (!currentPerson) {
      return sendResponse(res, false, 404, "Person not found");
    }

    // 2. Reset semua role -> isDefault = false
    const updatedRoles = currentPerson.role.map((r: IPersonRole) => ({
      ...r,
      isDefault: false
    }));

    // 3. Cari role sesuai roleName yang di-passing
    const targetRole = updatedRoles.find(r => r.roleName === roleName);

    if (!targetRole) {
      return sendResponse(res, false, 400, "Role not found");
    }

    targetRole.isDefault = true;

    // 4. Simpan ke DB lewat service
    await updatePersonRoleByPersonId(id, updatedRoles, getUsername(req), getWIBDate());

    return sendResponse(res, true, 200, "Default role updated successfully");
  } catch (err: any) {
    logger.error(`ERR: person - Update Default Role = ${err}`);
    return sendResponse(res, false, 500, err.message);
  }
};
