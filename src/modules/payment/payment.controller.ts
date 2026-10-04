import type { Request, Response } from "express";
import status from "http-status";
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
	const payment = await PaymentService.handleCallback(
		String(req.query.paymentID ?? ""),
		String(req.query.status ?? ""),
	);

	const paid = payment.status === "PAID";


	res.status(paid ? status.OK : status.PAYMENT_REQUIRED).json({
		success: paid,
		message: paid
			? "Payment successful"
			: `Payment ${payment.status.toLowerCase()}`,
		data: { id: payment.id, status: payment.status },
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
	getPaymentById,
};
