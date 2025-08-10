import { admin } from "../config/firebase";
import { ICategory } from "../models/category.model";
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { logger } from "../utils/logger";
import { IReport } from "../models/report.model";

export const getAllCategoryByCampusId = async (campusId: string): Promise<ICategory[]> => {

  const snapshot = await admin.firestore()
    .collection('Category')
    .where('campusId', '==', campusId)
    .where('isDeleted', '==', 'false')
    .get();

  const result: ICategory[] = [];


  snapshot.forEach((doc: QueryDocumentSnapshot) => {

    const data = doc.data();
    
    result.push({
      id: doc.id,
      name: data.name,
      campusId: data.campusId,
      isDeleted: data.isDeleted,
      createdBy: data.createdBy,
      createdDate: data.createdDate,
      lastUpdatedBy: data.lastUpdatedBy,
      lastUpdatedDate: data.lastUpdatedDate
    });

  });

  return result;


}

// Service untuk create category
export const createCategoryService = async (category: ICategory): Promise<void> => {
  await admin.firestore()
    .collection('Category')
    .doc(category.id) // id di-generate dari generateUID
    .set(category);
};

// Service untuk cek duplikasi category berdasarkan campusId & name
export const findCategoryByName = async (campusId: string, name: string): Promise<ICategory[]> => {
  const snapshot = await admin.firestore()
    .collection('Category')
    .where('campusId', '==', campusId)
    .where('isDeleted', '==', false)
    .where('name', '==', name)
    .get();

  const result: ICategory[] = [];
  snapshot.forEach((doc: QueryDocumentSnapshot) => {
    const data = doc.data();
    result.push({
      id: doc.id,
      name: data.name,
      campusId: data.campusId,
      isDeleted: data.isDeleted,
      createdBy: data.createdBy,
      createdDate: data.createdDate,
      lastUpdatedBy: data.lastUpdatedBy,
      lastUpdatedDate: data.lastUpdatedDate
    });
  });

  return result;
};

export const updateCategoryService = async (id: string, campusId: string, name: string) => {
  try {
    // Cek duplicate name di campus yang sama
    const existing = await admin.firestore()
      .collection("Category")
      .where("campusId", "==", campusId)
      .where("name", "==", name)
      .where("isDeleted", "==", false)
      .get();

    if (!existing.empty) {
      return { success: false, message: `Category with name "${name}" already exists` };
    }

    // Ambil category berdasarkan ID
    const docRef = admin.firestore().collection("Category").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, message: "Category not found" };
    }

    // Update category
    await docRef.update({
      campusId,
      name,
      lastUpdatedBy: "system",
      lastUpdatedDate: new Date().toISOString(),
    });

    return { success: true, message: "Category updated successfully" };
  } catch (err: any) {
    logger.error(`ERR: category - updateCategoryService = ${err}`);
    return { success: false, message: "Failed to update category" };
  }
};

export const getReportsByCategoryId = async (categoryId: string): Promise<IReport[]> => {
  const snapshot = await admin.firestore()
    .collection("Report")
    .where("category.categoryId", "==", categoryId)
    .where("isDeleted", "==", false)
    .get();

  const reports: IReport[] = [];
  snapshot.forEach((doc: QueryDocumentSnapshot) => {
    reports.push(doc.data() as IReport);
  });

  return reports;
};

// Ambil category by id
export const getCategoryById = async (id: string): Promise<ICategory | null> => {
  const docSnap = await admin.firestore().collection("Category").doc(id).get();
  if (!docSnap.exists) return null;
  return docSnap.data() as ICategory;
};

// Soft delete category
export const softDeleteCategory = async (id: string): Promise<void> => {
  await admin.firestore().collection("Category").doc(id).update({
    isDeleted: true,
    lastUpdatedBy: "system",
    lastUpdatedDate: new Date().toISOString()
  });
};