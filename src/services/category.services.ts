import { admin } from "../config/firebase";
import { ICategory } from "../models/category.model";
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

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