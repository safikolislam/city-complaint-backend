import type { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";

const getMe = catchAsync(async (req: Request, res: Response) => {
	const result = await UserService.getMe(req.user!.id);

	sendResponse(res, {
		statusCode: status.OK,
		message: "Profile retrieved successfully",
		data: result,
	});
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
	const result = await UserService.updateMe(req.user!.id, req.body);

	sendResponse(res, {
		statusCode: status.OK,
		message: "Profile updated successfully",
		data: result,
	});
});

export const UserController = { getMe, updateMe };