import type { NextFunction, Request, Response } from "express";
import { getCategoryStats } from "./category-stats.service";

export const categoryStatsController = async (
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const data = await getCategoryStats();
		res.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
		res.status(200).json({
			success: true,
			message: "Category stats retrieved successfully",
			data,
		});
	} catch (error) {
		next(error);
	}
};