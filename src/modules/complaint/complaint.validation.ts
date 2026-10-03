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

const updateComplaintSchema = z.object({
	body: z
		.object({
			title: z.string().min(5).max(150).optional(),
			description: z.string().min(10).optional(),
			address: z.string().min(3).optional(),
			latitude: z.number().min(-90).max(90).optional(),
			longitude: z.number().min(-180).max(180).optional(),
		})
		.strict()
		.refine((data) => Object.keys(data).length > 0, {
			message: "At least one field is required",
		}),
});





export const ComplaintValidation = {
	createComplaintSchema,
  updateComplaintSchema,
};