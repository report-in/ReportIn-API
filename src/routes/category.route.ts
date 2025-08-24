import express from "express";
import { createCategory, deleteCategoryById, getAllCategory, updateCategoryById } from "../controllers/category.controller";

const router = express.Router();

router.get('/', getAllCategory);
router.post('/', createCategory);
router.put('/:id', updateCategoryById);
router.delete('/:id', deleteCategoryById);

export const CategoryRouter = router;