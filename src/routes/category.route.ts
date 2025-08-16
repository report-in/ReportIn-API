import express from "express";
import { getAllCategory } from "../controllers/category.controller";

const router = express.Router();

router.get('/', getAllCategory);

export const CategoryRouter = router;