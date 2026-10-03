import { z } from "zod";

const createComplaintSchema = z.object({
	body: z.object({
		title: z.string().min(5, "Title must be at least 5 characters").max(150),
		description: z
			.string()
			.min(10, "Description must be at least 10 characters"),
		address: z.string().min(3, "Address is required"),
		categoryId: z.uuid("Invalid category id"),
		priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
		latitude: z.number().min(-90).max(90).optional(),
		longitude: z.number().min(-180).max(180).optional(),
	}),
});

export const ComplaintValidation = {
	createComplaintSchema,
};