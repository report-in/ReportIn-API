import { admin } from "../config/firebase";
import { ICategory } from "../models/category.model";
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
<<<<<<< HEAD
import { generateUID } from "../utils/generate-uid";
import { getWIBDate } from "../utils/wib-date";
import { getUsername } from "../utils/header";
=======
import { logger } from "../utils/logger";
import { IReport } from "../models/report.model";
>>>>>>> 7245ed056cb0c0cd1d41a6dfa9021530361c02af

export const getAllCategoryByCampusId = async (campusId: string): Promise<ICategory[]> => {

  const snapshot = await admin.firestore()
    .collection('Category')
    .where('campusId', '==', campusId)
    .where('isDeleted', '==', 'false')
    .get();

  const result: ICategory[] = [];


  snapshot.forEach((doc: QueryDocumentSnapshot) => {

    const data = doc.data();
<<<<<<< HEAD

=======
    
>>>>>>> 7245ed056cb0c0cd1d41a6dfa9021530361c02af
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

const CATEGORY_COLLECTION = "Category";

export const createCategory = async (req: any): Promise<void> => {
  const { campusId, name } = req.body;
  const username = getUsername(req);

  // cek apakah nama kategori sudah ada
  const snapshot = await admin
    .firestore()
    .collection(CATEGORY_COLLECTION)
    .where("campusId", "==", campusId)
    .where("name", "==", name)
    .where("isDeleted", "==", false)
    .get();

  if (!snapshot.empty) {
    throw new Error("Category name already exists");
  }

  const categoryId = generateUID();
  const now = getWIBDate();

  const newCategory: ICategory = {
    id: categoryId,
    name,
    campusId,
    isDeleted: false,
    createdBy: username,
    createdDate: now,
    lastUpdatedBy: username,
    lastUpdatedDate: now,
  };

  await db.collection(CATEGORY_COLLECTION).doc(categoryId).set(newCategory);
};

const db = admin.firestore();

export const updateCategoryById = async (
  id: string,
  campusId: string,
  name: string,
  username: string
): Promise<void> => {
  // pastikan dokumen ada
  const docRef = db.collection(CATEGORY_COLLECTION).doc(id);
  const docSnap = await docRef.get();
  if (!docSnap.exists) {
    throw new Error(`Category with id '${id}' not found`);
  }

  // cek duplikat name (exclude current id)
  const dupSnap = await admin
    .firestore()
    .collection(CATEGORY_COLLECTION)
    .where("campusId", "==", campusId)
    .where("name", "==", name)
    .where("isDeleted", "==", false)
    .get();

  const hasOther =
    !dupSnap.empty &&
    dupSnap.docs.some((d: FirebaseFirestore.QueryDocumentSnapshot) => d.id !== id);

  if (hasOther) {
    throw new Error(`Category name '${name}' already exists`);
  }

  await docRef.update({
    campusId,
    name,
    lastUpdatedBy: username,
    lastUpdatedDate: getWIBDate(),
  });
};

export const deleteCategoryService = async (id: string) => {
  try {
    //Cek semua Report dengan categoryId = id dan isDeleted = false
    const reportSnap = await db
      .collection("REPORT")
      .where("categoryId", "==", id)
      .where("isDeleted", "==", false)
      .get();

    if (!reportSnap.empty) {
      const hasNotDone = reportSnap.docs.some(
        (doc: FirebaseFirestore.QueryDocumentSnapshot) =>
          doc.data().status !== "Done"
      );

      if (hasNotDone) {
        return {
          status: false,
          statusCode: 400,
          message: "Category tidak bisa dihapus, masih ada report yang belum Done.",
          data: null,
        };
      }
    }

    //Cari Category by id dan isDeleted = false
    const categoryRef = db.collection(CATEGORY_COLLECTION).doc(id);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists || categoryDoc.data()?.isDeleted) {
      return {
        status: false,
        statusCode: 404,
        message: "Category tidak ditemukan atau sudah terhapus.",
        data: null,
      };
    }

    //Soft delete -> set isDeleted = true
    await categoryRef.update({ isDeleted: true });

    return {
      status: true,
      statusCode: 200,
      message: "Category berhasil dihapus (soft delete).",
      data: null,
    };
  } catch (error: any) {
    return {
      status: false,
      statusCode: 500,
      message: error.message || "Gagal menghapus category.",
      data: null,
    };
  }
};