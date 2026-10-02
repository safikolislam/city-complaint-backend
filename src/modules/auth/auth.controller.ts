import type { Request, Response } from "express";
import status from "http-status";

import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import { catchAsync } from "../../utils/catchASync";

const registerUser = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthService.registerUserIntoDB(req.body);

	sendResponse(res, {
		statusCode: status.CREATED,
		message: "User registered successfully",
		data: result,
	});
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
	const { accessToken, refreshToken, user } = await AuthService.loginUser(
		req.body,
	);

	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: true, 
		sameSite: "lax",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	sendResponse(res, {
		statusCode: status.OK,
		message: "Login successful",
		data: { accessToken, user },
	});
});

export const AuthController = {
	registerUser,
	loginUser,
};