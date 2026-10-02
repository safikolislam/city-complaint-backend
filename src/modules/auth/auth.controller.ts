import type { Request, Response } from "express";
import status from "http-status";
import config from "../../config";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const cookieOptions = {
	httpOnly: true,
	secure: config.node_env === "production",
	sameSite: "lax" as const,
	maxAge: 7 * 24 * 60 * 60 * 1000,
};

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

	res.cookie("refreshToken", refreshToken, cookieOptions);

	sendResponse(res, {
		statusCode: status.OK,
		message: "Login successful",
		data: { accessToken, user },
	});
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthService.refreshAccessToken(req.cookies.refreshToken);

	res.cookie("refreshToken", result.refreshToken, cookieOptions);

	sendResponse(res, {
		statusCode: status.OK,
		message: "Access token refreshed successfully",
		data: { accessToken: result.accessToken },
	});
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
	await AuthService.logoutUser(req.cookies.refreshToken);

	res.clearCookie("refreshToken", {
		httpOnly: true,
		secure: config.node_env === "production",
		sameSite: "lax",
	});

	sendResponse(res, {
		statusCode: status.OK,
		message: "Logged out successfully",
		data: null,
	});
});

export const AuthController = {
	registerUser,
	loginUser,
	refreshToken,
	logoutUser,
};
