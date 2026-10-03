import status from "http-status";
import { prisma } from "../../../lib/prisma";
import AppError from "../../../utils/AppError";
import type {
	IAssignPayload,
	IAuthUser,
	IChangeStatusPayload,
	TStatus,
} from "../complaint.interface";

import { getStaffProfile } from "./complaint.shared";
import { canTransition } from "../complaint.workflow";

const assignComplaint = async (
	user: IAuthUser,
	id: string,
	payload: IAssignPayload,
) => {
	const actor = await getStaffProfile(user.id);

	const complaint = await prisma.complaint.findFirst({
		where: { id, deletedAt: null },
	});
	if (!complaint) throw new AppError(status.NOT_FOUND, "Complaint not found");


	if (actor.role === "STAFF") {
		if (actor.departmentId !== complaint.departmentId) {
			throw new AppError(status.FORBIDDEN, "Not your department");
		}
		if (actor.staffPosition === "TECHNICIAN") {
			throw new AppError(status.FORBIDDEN, "Technicians cannot assign");
		}
	}

	if (!["PENDING", "REOPENED"].includes(complaint.status)) {
		throw new AppError(
			status.CONFLICT,
			`Cannot assign a complaint that is ${complaint.status}`,
		);
	}

	const checkAssignee = async (
		assigneeId: string,
		mustBeTechnician: boolean,
	) => {
		const a = await getStaffProfile(assigneeId);
		if (a.role !== "STAFF" || a.departmentId !== complaint.departmentId) {
			throw new AppError(
				status.BAD_REQUEST,
				"Assignee must be staff of the same department",
			);
		}
		if (mustBeTechnician && a.staffPosition !== "TECHNICIAN") {
			throw new AppError(
				status.BAD_REQUEST,
				"technicianId must belong to a technician",
			);
		}
	};

	if (payload.staffId) await checkAssignee(payload.staffId, false);
	if (payload.technicianId) await checkAssignee(payload.technicianId, true);


	return prisma.$transaction(async (tx) => {
		const updated = await tx.complaint.updateMany({
			where: { id, status: complaint.status },
			data: {
				staffId: payload.staffId ?? complaint.staffId,
				technicianId: payload.technicianId ?? complaint.technicianId,
				status: "ASSIGNED",
			},
		});
		if (updated.count === 0) {
			throw new AppError(
				status.CONFLICT,
				"Complaint was changed by someone else",
			);
		}

		await tx.complaintStatusHistory.create({
			data: {
				complaintId: id,
				fromStatus: complaint.status,
				toStatus: "ASSIGNED",
				note: "Assigned",
				changedById: user.id,
			},
		});
		await tx.auditLog.create({
			data: {
				actorId: user.id,
				action: "COMPLAINT_ASSIGNED",
				entity: "Complaint",
				entityId: id,
				metadata: {
					staffId: payload.staffId ?? null,
					technicianId: payload.technicianId ?? null,
				},
			},
		});

		return tx.complaint.findUnique({
			where: { id },
			select: {
				id: true,
				status: true,
				staffId: true,
				technicianId: true,
				updatedAt: true,
			},
		});
	});
};

const changeStatus = async (
	user: IAuthUser,
	id: string,
	payload: IChangeStatusPayload,
) => {
	const complaint = await prisma.complaint.findFirst({
		where: { id, deletedAt: null },
	});
	if (!complaint) throw new AppError(status.NOT_FOUND, "Complaint not found");

	const from = complaint.status as TStatus;
	const to = payload.status;

	const isAssignee =
		complaint.staffId === user.id || complaint.technicianId === user.id;


	if (to === "CLOSED" || to === "REOPENED") {
		if (user.role !== "CITIZEN" || complaint.citizenId !== user.id) {
			throw new AppError(status.FORBIDDEN, "Only the citizen can do this");
		}
	} else if (user.role === "STAFF") {
		if (!isAssignee) {
			throw new AppError(
				status.FORBIDDEN,
				"You are not assigned to this complaint",
			);
		}
	} else if (user.role !== "ADMIN") {
		throw new AppError(status.FORBIDDEN, "Not allowed");
	}

	if (!canTransition(from, to)) {
		throw new AppError(
			status.CONFLICT,
			`Cannot change status from ${from} to ${to}`,
		);
	}

	return prisma.$transaction(async (tx) => {
		const result = await tx.complaint.updateMany({
			where: { id, status: from },
			data: {
				status: to,
				resolvedAt: to === "RESOLVED" ? new Date() : undefined,
				closedAt: to === "CLOSED" ? new Date() : undefined,
			},
		});
		if (result.count === 0) {
			throw new AppError(
				status.CONFLICT,
				"Complaint was changed by someone else",
			);
		}

		await tx.complaintStatusHistory.create({
			data: {
				complaintId: id,
				fromStatus: from,
				toStatus: to,
				note: payload.note,
				changedById: user.id,
			},
		});
		await tx.auditLog.create({
			data: {
				actorId: user.id,
				action: "COMPLAINT_STATUS_CHANGED",
				entity: "Complaint",
				entityId: id,
				metadata: { from, to },
			},
		});

		return tx.complaint.findUnique({
			where: { id },
			select: { id: true, status: true, resolvedAt: true, closedAt: true },
		});
	});
};

const cancelComplaint = async (user: IAuthUser, id: string, note?: string) => {
	const complaint = await prisma.complaint.findFirst({
		where: { id, citizenId: user.id, deletedAt: null },
	});
	if (!complaint) throw new AppError(status.NOT_FOUND, "Complaint not found");

	const from = complaint.status as TStatus;
	if (!canTransition(from, "CANCELLED")) {
		throw new AppError(status.CONFLICT, `Cannot cancel a ${from} complaint`);
	}

	return prisma.$transaction(async (tx) => {
		const result = await tx.complaint.updateMany({
			where: { id, status: from },
			data: { status: "CANCELLED" },
		});
		if (result.count === 0) {
			throw new AppError(
				status.CONFLICT,
				"Complaint was changed by someone else",
			);
		}
		await tx.complaintStatusHistory.create({
			data: {
				complaintId: id,
				fromStatus: from,
				toStatus: "CANCELLED",
				note: note ?? "Cancelled by citizen",
				changedById: user.id,
			},
		});
		await tx.auditLog.create({
			data: {
				actorId: user.id,
				action: "COMPLAINT_CANCELLED",
				entity: "Complaint",
				entityId: id,
				metadata: { from },
			},
		});
		return { id, status: "CANCELLED" as const };
	});
};

export const ComplaintWorkflowService = {
	assignComplaint,
	changeStatus,
	cancelComplaint,
};