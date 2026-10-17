import type { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";
import { PublicService } from "./public.service";

const getPublicStats = catchAsync(async (_req: Request, res: Response) => {
	const result = await PublicService.getPublicStats();

	sendResponse(res, {
		statusCode: status.OK,
		message: "Public stats retrieved successfully",
		data: result,
	});
});

export const PublicController = {
	getPublicStats,
};