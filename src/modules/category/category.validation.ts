import { z } from "zod";

const createCategorySchema = z.object({
	body: z.object({
		name: z.string().min(3).max(80),
		description: z.string().max(300).optional(),
		slaHours: z.number().int().min(1).max(720).default(72),
		serviceFee: z.number().positive().max(100000).optional(),
		departmentId: z.uuid("Invalid department id"),
	}),
});

export const CategoryValidation = { createCategorySchema };