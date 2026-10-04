
import { z } from "zod";

const initiatePaymentSchema = z.object({
	body: z.object({
		complaintId: z.string().uuid("Invalid complaint id"),
	}),
});

const paymentIdParamSchema = z.object({
	params: z.object({
		id: z.string().uuid("Invalid payment id"),
	}),
});

export const PaymentValidation = {
	initiatePaymentSchema,
	paymentIdParamSchema,
};
