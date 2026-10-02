import { z } from "zod";

const registerSchema = z.object({
	body: z.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Invalid email"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(/[A-Z]/, "Must contain an uppercase letter")
			.regex(/[0-9]/, "Must contain a number"),
		phone: z
			.string()
			.regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi phone number")
			.optional(),
	}),
});

const loginSchema = z.object({
	body: z.object({
		email: z.string().email("Invalid email"),
		password: z.string().min(1, "Password is required"),
	}),
});

export const AuthValidation = {
	registerSchema,
	loginSchema,
};
