import { randomUUID } from "node:crypto";
import status from "http-status";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { createBkashPayment, executeBkashPayment } from "../../utils/bkash";
import type { IAuthUser } from "../complaint/complaint.interface";

const initiatePayment = async (user: IAuthUser, complaintId: string) => {
	const complaint = await prisma.complaint.findFirst({
		where: { id: complaintId, citizenId: user.id, deletedAt: null },
		include: { category: true },
	});
	if (!complaint) throw new AppError(status.NOT_FOUND, "Complaint not found");
	if (
		complaint.status !== "PENDING_PAYMENT" ||
		!complaint.category.serviceFee
	) {
		throw new AppError(status.CONFLICT, "This request does not need payment");
	}

	const transactionId = `TXN-${randomUUID()}`;
	const amount = complaint.category.serviceFee;

	const payment = await prisma.payment.create({
		data: {
			complaintId,
			userId: user.id,
			amount,
			gateway: "BKASH",
			transactionId,
		},
	});

	const result = await createBkashPayment({
		amount: amount.toString(),
		invoiceNumber: transactionId,
		callbackURL: `${config.app_url}/api/v1/payments/callback`,
		payerReference: user.id,
	});

	if (!result.bkashURL || !result.paymentID) {
		await prisma.payment.update({
			where: { id: payment.id },
			data: { status: "FAILED", rawResponse: result },
		});
		throw new AppError(
			status.BAD_GATEWAY,
			result.statusMessage ?? "bKash error",
		);
	}

	await prisma.payment.update({
		where: { id: payment.id },
		data: { gatewayRef: result.paymentID },
	});

	return { paymentId: payment.id, bkashURL: result.bkashURL };
};

const handleCallback = async (paymentID?: string, bkashStatus?: string) => {
	if (!paymentID) throw new AppError(status.BAD_REQUEST, "paymentID missing");

	const payment = await prisma.payment.findFirst({
		where: { gatewayRef: paymentID },
	});
	if (!payment) throw new AppError(status.NOT_FOUND, "Payment not found");

	if (payment.status !== "PENDING") return payment;

	if (bkashStatus === "cancel" || bkashStatus === "failure") {
		return prisma.payment.update({
			where: { id: payment.id },
			data: { status: bkashStatus === "cancel" ? "CANCELLED" : "FAILED" },
		});
	}

	const exec = await executeBkashPayment(paymentID);
	const ok =
		exec.statusCode === "0000" && exec.transactionStatus === "Completed";

	if (!ok) {
		return prisma.payment.update({
			where: { id: payment.id },
			data: { status: "FAILED", rawResponse: exec },
		});
	}

	if (Number(exec.amount) !== Number(payment.amount)) {
		return prisma.payment.update({
			where: { id: payment.id },
			data: { status: "FAILED", rawResponse: exec },
		});
	}

	const complaint = await prisma.complaint.findUniqueOrThrow({
		where: { id: payment.complaintId },
		include: { category: true },
	});

	return prisma.$transaction(async (tx) => {
		const marked = await tx.payment.updateMany({
			where: { id: payment.id, status: "PENDING" },
			data: {
				status: "PAID",
				paidAt: new Date(),
				rawResponse: exec,
			},
		});
		if (marked.count === 0) return payment;

		await tx.complaint.updateMany({
			where: { id: complaint.id, status: "PENDING_PAYMENT" },
			data: {
				status: "PENDING",
				dueAt: new Date(Date.now() + complaint.category.slaHours * 3600 * 1000),
			},
		});
		await tx.complaintStatusHistory.create({
			data: {
				complaintId: complaint.id,
				fromStatus: "PENDING_PAYMENT",
				toStatus: "PENDING",
				note: `Payment received (bKash ${exec.trxID ?? ""})`,
				changedById: payment.userId,
			},
		});
		await tx.auditLog.create({
			data: {
				actorId: payment.userId,
				action: "PAYMENT_COMPLETED",
				entity: "Payment",
				entityId: payment.id,
				metadata: { trxID: exec.trxID ?? null },
			},
		});
		return tx.payment.findUniqueOrThrow({ where: { id: payment.id } });
	});
};

const getPaymentById = async (user: IAuthUser, id: string) => {
	const payment = await prisma.payment.findFirst({
		where: { id, ...(user.role === "ADMIN" ? {} : { userId: user.id }) },
		select: {
			id: true,
			complaintId: true,
			amount: true,
			currency: true,
			gateway: true,
			status: true,
			transactionId: true,
			paidAt: true,
			createdAt: true,
		},
	});
	if (!payment) throw new AppError(status.NOT_FOUND, "Payment not found");
	return payment;
};

export const PaymentService = {
	initiatePayment,
	handleCallback,
	getPaymentById,
};
