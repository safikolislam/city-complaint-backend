import { z } from "zod";

const initiatePaymentSchema = z.object({
	body: z.object({ complaintId: z.uuid("Invalid complaint id") }).strict(),
});

export const PaymentValidation = { initiatePaymentSchema };