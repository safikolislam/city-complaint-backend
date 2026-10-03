import { Router } from "express";
import auth from "../../middlewares/auth/auth";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router = Router();

router.post(
	"/initiate",
	auth("CITIZEN"),
	validateRequest(PaymentValidation.initiatePaymentSchema),
	PaymentController.initiatePayment,
);

router.get("/callback", PaymentController.bkashCallback);

router.get("/:id", auth("CITIZEN", "ADMIN"), PaymentController.getPaymentById);

export const paymentRoutes = router;
