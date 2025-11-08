import { Request, Response } from "express";
import { admin } from "../config/firebase";
import { IPerson, IPersonRole } from "../models/person.model";
import { logger } from "../utils/logger";
import { sendResponse } from "../utils/send-response";
import { getWIBDate } from "../utils/wib-date";
import { personLoginValidation, updateDefaultPersonRoleValidation, updatePersonRoleValidation, updatePersonStatusValidation } from "../validations/person.validation";
import { getAllPersonByCampusId, getPersonByEmailandCampusId, getPersonByPersonIdandCampusId, registerPerson, updatePersonRoleByPersonId, updatePersonStatusByPersonId } from "../services/person.service";
import { any } from "joi";
import { getUsername } from "../utils/header";
import { createLeaderboard, getLeaderboardByPersonId, updateLeaderboardStatus } from "../services/leaderboard.service";
import { getCampusById } from "../services/campus.services";
import { generateUID } from "../utils/generate-uid";

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

    const campusInfo = await getCampusById(value.campusId);
    const campusMandatoryEmail = campusInfo?.mandatoryEmail ?? null;

    if (!campusMandatoryEmail || !campusMandatoryEmail.some(domain => email?.toLowerCase().endsWith(domain.toLowerCase()))) {
      logger.error(`ERR: person - login = Mandatory email not match`);
      return sendResponse(res, false, 422, "Invalid email domain. Please use your authorized email to continue.");
    }

    let person = await getPersonByEmailandCampusId(email, value.campusId);

    if (!person && email) {
      const role: IPersonRole = {
        roleId: "gNTymOZbhsyxJ5pmO5VX",
        roleName: 'FacilityUser',
        isDefault: true
      }

      const newPerson: IPerson = {
        id: generateUID(),
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

    // 🔹 1. Mapping roles (index 0 selalu default = facilityUser)
    const newRoles: IPersonRole[] = role.map((r: IPersonRole, index: number) => ({
      roleId: r.roleId,
      roleName: r.roleName,
      isDefault: index === 0
    }));

    // 🔹 2. Update roles ke DB
    await updatePersonRoleByPersonId(id, newRoles, getUsername(req), getWIBDate());

    // 🔹 3. Cek apakah role punya Technician
    const hasTechnician = newRoles.some(r => r.roleName === "Technician");

    // 🔹 4. Ambil person untuk data insert leaderboard
    const person = await getPersonByPersonIdandCampusId(id, campusId);
    if (!person) {
      return sendResponse(res, false, 404, "Person not found");
    }

    // 🔹 5. Cek leaderboard existing
    const leaderboard = await getLeaderboardByPersonId(id, campusId);

    if (hasTechnician) {
      if (leaderboard) {
        // update supaya aktif kembali
        await updateLeaderboardStatus(leaderboard.id, false, getUsername(req));
      } else {
        // insert baru
        await createLeaderboard(id, campusId, person.name, person.email);
      }
    } else {
      if (leaderboard) {
        // set inactive
        await updateLeaderboardStatus(leaderboard.id, true, getUsername(req));
      }
    }

    return sendResponse(res, true, 200, "Person updated successfully");
  } catch (err: any) {
    logger.error(`ERR: person - Update Person Role = ${err}`);
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

    if (currentPerson?.role.find((r: any) => r.roleName === "Technician")) {
      await updatePersonStatusByPersonId(id, status, getUsername(req), getWIBDate());
    } else {
      return sendResponse(res, false, 422, "You dont have the Technician Role!")
    }

    return sendResponse(res, true, 200, "Status updated successfully");
  } catch (err: any) {
    logger.error(`ERR: person - Update Person Status = ${err}`)
    return sendResponse(res, false, 422, err.message);
  }
};

export const updateDefaultPersonRole = async (req: Request, res: Response) => {
  const { params: { id } } = req; // personId dari URL
  const { error, value } = updateDefaultPersonRoleValidation(req.body);  // roleName dari body

  const { roleName, campusId } = value;

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
    const currentPerson = await getPersonByPersonIdandCampusId(id, campusId);

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

    return sendResponse(res, true, 200, "Default role updated successfully", value);
  } catch (err: any) {
    logger.error(`ERR: person - Update Default Role = ${err}`);
    return sendResponse(res, false, 500, err.message);
  }
};
