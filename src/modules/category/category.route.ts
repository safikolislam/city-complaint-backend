import { Router } from "express";
import auth from "../../middlewares/auth/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryController } from "./category.controller";
import { CategoryValidation } from "./category.validation";

const router = Router();

router.get("/categories", auth(), CategoryController.getAllCategories);
router.get("/categories/:id", auth(), CategoryController.getCategoryById);
router.post(
	"/categories",
	auth("ADMIN"),
	validateRequest(CategoryValidation.createCategorySchema),
	CategoryController.createCategory,
);
router.get(
	"/departments",
	auth("ADMIN", "STAFF"),
	CategoryController.getAllDepartments,
);

export const categoryRoutes = router;