import { Router } from "express";
import auth from "../../middlewares/auth/auth";
import { paymentLimiter } from "../../middlewares/rateLimiter";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router = Router();

router.post(
	"/initiate",
	paymentLimiter,
	auth("CITIZEN"),
	validateRequest(PaymentValidation.initiatePaymentSchema),
	PaymentController.initiatePayment,
);

router.get("/callback", PaymentController.bkashCallback);

router.get("/", auth("CITIZEN", "ADMIN"), PaymentController.getAllPayments);

router.get(
	"/:id",
	auth("CITIZEN", "ADMIN"),
	validateRequest(PaymentValidation.paymentIdParamSchema),
	PaymentController.getPaymentById,
);

export const paymentRoutes = router;
