import type { Request, Response } from "express";
import status from "http-status";
import config from "../../config";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";


const initiatePayment = catchAsync(async (req: Request, res: Response) => {
	const data = await PaymentService.initiatePayment(
		req.user!,
		req.body.complaintId,
	);

	sendResponse(res, {
		statusCode: status.OK,
		message: "Payment initiated, open bkashURL to pay",
		data,
	});
});

const bkashCallback = catchAsync(async (req: Request, res: Response) => {
	const target = (path: string, complaintId?: string) => {
		const url = new URL(path, config.frontend_url);
		if (complaintId) url.searchParams.set("complaintId", complaintId);
		return url.toString();
	};

	try {
		const payment = await PaymentService.handleCallback(
			String(req.query.paymentID ?? ""),
			String(req.query.status ?? ""),
		);
		const page = payment.status === "PAID" ? "success" : "cancel";
		res.redirect(target(`/payment/${page}`, payment.complaintId));
	} catch {
		res.redirect(target("/payment/cancel"));
	}
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
	const { data, meta } = await PaymentService.getAllPayments(
		req.user!,
		req.query,
	);

	sendResponse(res, {
		statusCode: status.OK,
		message: "Payments retrieved successfully",
		meta,
		data,
	});
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
	const data = await PaymentService.getPaymentById(
		req.user!,
		String(req.params.id),
	);

	sendResponse(res, {
		statusCode: status.OK,
		message: "Payment retrieved successfully",
		data,
	});
});

export const PaymentController = {
	initiatePayment,
	bkashCallback,
	getAllPayments,
	getPaymentById,
};
