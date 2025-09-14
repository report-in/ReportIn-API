import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { IPerson, IPersonRole } from "../models/person.model";
import { IGetPersonResponse, IGetPersonRoleResponse, ILoginCampusResponse } from "../types/response/person.response";
import { logger } from "../utils/logger";

export const getPersonByEmailandCampusId = async (email: string | undefined, campusId: string | undefined): Promise<ILoginCampusResponse | null> => {
  try {
    const personsRef = db.collection('Person');
    const querySnapshot = await personsRef.where('email', '==', email).where('campusId', '==', campusId).limit(1).get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    const person: ILoginCampusResponse = {
      id: doc.id,
      campusId: data.campusId,
      name: data.name,
      email: data.email,
      role: data.role,
    };

    return person;
  } catch (error) {
    logger.error(`ERR: getPersonByEmail() = ${error}`)
    throw error;
  }
};

export const registerPerson = async (person: IPerson): Promise<ILoginCampusResponse | null> => {
  try {
    await db.collection('Person').doc(person.id).set(person);
    logger.info(`Person Registered = ${person.id} - ${person.campusId} - ${person.name} - ${person.email}`);

    const response: ILoginCampusResponse = {
      id: person.id,
      campusId: person.campusId,
      name: person.name,
      email: person.email,
      role: person.role,
    };

    return response;
  } catch (error) {
    logger.error(`ERR: registerPerson() = ${error}`)
    throw error;
  }
};

export const getAllPersonByCampusId = async (campusId: string): Promise<IGetPersonResponse[] | null> => {
  try {
    const personsRef = db.collection('Person');
    const querySnapshot = await personsRef.where('campusId', '==', campusId).where('isDeleted', '==', false).get();

    if (querySnapshot.empty) {
      return null;
    }

    const persons: IGetPersonResponse[] = [];

    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();

      persons.push({
        id: doc.id,
        campusId: data.campusId,
        name: data.name,
        role: data.role,
        email: data.email,
        createdBy: data.createdBy,
        createdDate: data.createdDate,
        lastUpdatedBy: data.lastUpdatedBy,
        lastUpdatedDate: data.lastUpdatedDate,
      });
    });

    return persons;
  } catch (error) {
    logger.error(`ERR: getAllPerson() = ${error}`)
    throw error;
  }
};


export const updatePersonRoleByPersonId = async (personId: string, role: IPersonRole[], lastUpdatedBy: string, lastUpdatedDate: string): Promise<void> => {
  try {
    await db.collection('Person').doc(personId).update({ role: role, lastUpdatedBy: lastUpdatedBy,lastUpdatedDate: lastUpdatedDate});
    logger.info(`Person Role updated = ${personId} - ${role}`);
  } catch (error) {
    logger.error(`ERR: updatePersonRoleByPersonId() = ${error}`)
    throw error;
  }
};

export const updatePersonStatusByPersonId = async (personId: string, status: boolean,lastUpdatedBy: string, lastUpdatedDate: string): Promise<void> => {
  try {
    await db.collection('Person').doc(personId).update({ status: status, lastUpdatedBy: lastUpdatedBy,lastUpdatedDate: lastUpdatedDate });
    logger.info(`Person Status updated = ${personId} - ${status}`);
  } catch (error) {
    logger.error(`ERR: updatePersonStatusByPersonId() = ${error}`)
    throw error;
  }
};

export const getPersonByPersonIdandCampusId = async (personId: string | undefined, campusId: string | undefined): Promise<IGetPersonResponse | null> => {
  try {
    const personsRef = db.collection('Person');
    const querySnapshot = await personsRef.where('id', '==', personId).where('campusId', '==', campusId).limit(1).get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    const person: IGetPersonResponse = {
      id: data.Id,
      campusId: data.campusId,
      name: data.name,
      role: data.role,
      email: data.email,
      createdBy: data.createdBy,
      createdDate: data.createdDate,
      lastUpdatedBy: data.lastUpdatedBy,
      lastUpdatedDate: data.lastUpdatedBy
    };

    return person;
  } catch (error) {
    logger.error(`ERR: getPersonByEmail() = ${error}`)
    throw error;
  }
};