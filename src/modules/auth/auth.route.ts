import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
	"/register",
	validateRequest(AuthValidation.registerSchema),
	AuthController.registerUser,
);

router.post(
	"/login",
	validateRequest(AuthValidation.loginSchema),
	AuthController.loginUser,
);

router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logoutUser);

export const authRoutes = router;
