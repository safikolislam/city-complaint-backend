import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type TParsed = {
	body: Request["body"];
};

const validateRequest = (schema: ZodType<TParsed>) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse({
			body: req.body,
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

		req.body = result.data.body;
		next();
	};
};

export default validateRequest;
