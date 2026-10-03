import type { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";
import { ComplaintService } from "./complaint.service";

const createComplaint = catchAsync(async (req: Request, res: Response) => {
	const result = await ComplaintService.createComplaint(req.user!, req.body);

	sendResponse(res, {
		statusCode: status.CREATED,
		message: "Complaint submitted successfully",
		data: result,
	});
});

const getAllComplaints = catchAsync(async (req: Request, res: Response) => {
	const { data, meta } = await ComplaintService.getAllComplaints(
		req.user!,
		req.query,
	);

	sendResponse(res, {
		statusCode: status.OK,
		message: "Complaints retrieved successfully",
		meta,
		data,
	});
});

const getComplaintById = catchAsync(async (req: Request, res: Response) => {
	const result = await ComplaintService.getComplaintById(
		req.user!,
		String(req.params.id),
	);

	sendResponse(res, {
		statusCode: status.OK,
		message: "Complaint retrieved successfully",
		data: result,
	});
});

export const ComplaintController = {
	createComplaint,
	getAllComplaints,
	getComplaintById,
};