import express from "express";
import { createCategoryController, deleteCategory, getAllCategory, updateCategory } from "../controllers/category.controller";

const router = express.Router();

router.get('/', getAllCategory);
router.post("/", createCategoryController);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export const CategoryRouter = router;