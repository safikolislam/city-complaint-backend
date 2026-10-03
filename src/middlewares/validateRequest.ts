import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

const validateRequest = (schema: ZodType) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse({
			body: req.body ?? {},
			query: req.query,
			params: req.params,
		});

		if (!result.success) {
			res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: result.error.issues.map((issue) => ({
					field: issue.path.slice(1).join("."),
					message: issue.message,
				})),
			});
			return;
		}

		const data = result.data as { body?: Request["body"] };
		if (data.body !== undefined) {
			req.body = data.body;
		}
		next();
	};
};

export default validateRequest;
