import { z } from "zod";

const updateMe = z.object({
	body: z
		.object({
			name: z
				.string()
				.trim()
				.min(2, "Name must be at least 2 characters")
				.optional(),
			phone: z
				.string()
				.regex(/^(?:\+8801|01)[3-9]\d{8}$/, "Invalid Bangladeshi phone number")
				.optional(),
		})
		.strict()
		.refine((data) => Object.keys(data).length > 0, {
			message: "At least one field is required",
		}),
});

export const UserValidation = { updateMe };
