import type { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminService } from "./admin.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
	const { data, meta } = await AdminService.getAllUsers(req.query);
	sendResponse(res, {
		statusCode: status.OK,
		message: "Users retrieved successfully",
		meta,
		data,
	});
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
	const data = await AdminService.updateUserRole(
		req.user!.id,
		String(req.params.id),
		req.body,
	);
	sendResponse(res, {
		statusCode: status.OK,
		message: "User role updated successfully",
		data,
	});
});

const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
	const { data, meta } = await AdminService.getAuditLogs(req.query);
	sendResponse(res, {
		statusCode: status.OK,
		message: "Audit logs retrieved successfully",
		meta,
		data,
	});
});

const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
	const data = await AdminService.getDashboardStats();
	sendResponse(res, {
		statusCode: status.OK,
		message: "Dashboard stats retrieved successfully",
		data,
	});
});

export const AdminController = {
	getAllUsers,
	updateUserRole,
	getAuditLogs,
	getDashboardStats,
};
