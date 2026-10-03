import type { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";
import { ComplaintService } from "./services";

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

const updateComplaint = catchAsync(async (req: Request, res: Response) => {
	const result = await ComplaintService.updateComplaint(
		req.user!,
		String(req.params.id),
		req.body,
	);

	sendResponse(res, {
		statusCode: status.OK,
		message: "Complaint updated successfully",
		data: result,
	});
});

const deleteComplaint = catchAsync(async (req: Request, res: Response) => {
	await ComplaintService.deleteComplaint(req.user!, String(req.params.id));

	sendResponse(res, {
		statusCode: status.OK,
		message: "Complaint deleted successfully",
		data: null,
	});
});

const assignComplaint = catchAsync(async (req: Request, res: Response) => {
	const data = await ComplaintService.assignComplaint(
		req.user!,
		String(req.params.id),
		req.body,
	);

	sendResponse(res, {
		statusCode: status.OK,
		message: "Complaint assigned successfully",
		data,
	});
});

const changeStatus = catchAsync(async (req: Request, res: Response) => {
	const data = await ComplaintService.changeStatus(
		req.user!,
		String(req.params.id),
		req.body,
	);

	sendResponse(res, {
		statusCode: status.OK,
		message: "Status updated successfully",
		data,
	});
});

const cancelComplaint = catchAsync(async (req: Request, res: Response) => {
	const data = await ComplaintService.cancelComplaint(
		req.user!,
		String(req.params.id),
		req.body?.note,
	);

	sendResponse(res, {
		statusCode: status.OK,
		message: "Complaint cancelled successfully",
		data,
	});
});

const getMyAssigned = catchAsync(async (req: Request, res: Response) => {
	const { data, meta } = await ComplaintService.getMyAssigned(
		req.user!,
		req.query,
	);

	sendResponse(res, {
		statusCode: status.OK,
		message: "Assigned complaints retrieved successfully",
		meta,
		data,
	});
});

export const ComplaintController = {
	createComplaint,
	getAllComplaints,
	getComplaintById,
	updateComplaint,
	deleteComplaint,
	assignComplaint,
	changeStatus,
	cancelComplaint,
	getMyAssigned,
};
