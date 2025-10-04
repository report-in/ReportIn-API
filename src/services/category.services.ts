import { admin } from "../config/firebase";
import { ICategory } from "../models/category.model";
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { generateUID } from "../utils/generate-uid";
import { getWIBDate } from "../utils/wib-date";
import { getUsername } from "../utils/header";
import { resourceLimits } from "worker_threads";

export const getAllCategoryByCampusId = async (campusId: string,
  search: string,
  limit: number,
  offset: number
): Promise<{data: ICategory[]; totalItems: number}> => {

  const snapshot = await admin.firestore()
    .collection('Category')
    .where('campusId', '==', campusId)
    .where('isDeleted', '==', false)
    .get();

  if (snapshot.empty) {
    return { data: [], totalItems: 0 };
  }

  let result: ICategory[] = [];
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

  if (search) {
    const searchLower = search.toLowerCase();
    result = result.filter((a) =>
      a.name.toLowerCase().includes(searchLower)
    );
  }

  const totalItems = result.length;

  const paginatedCategories = result.slice(offset, offset + limit);

  return { data: paginatedCategories, totalItems };
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
          message: `Category deleted = ${id}`,
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
        message: `ERR: deleteAreaByAreaId() = Category not found or already deleted.`,
        data: null,
      };
    }

    //Soft delete -> set isDeleted = true
    await categoryRef.update({ isDeleted: true });

    return {
      status: true,
      statusCode: 200,
      message: "Category deleted successfully",
      data: null,
    };
  } catch (error: any) {
    return {
      status: false,
      statusCode: 500,
      message: error.message || "ERR: deleteAreaByAreaId() = Failed to delete category",
      data: null,
    };
  }
};