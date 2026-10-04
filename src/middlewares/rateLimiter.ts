import rateLimit from "express-rate-limit";

export const paymentLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many payment attempts, try again later",
		errors: [],
	},
});
