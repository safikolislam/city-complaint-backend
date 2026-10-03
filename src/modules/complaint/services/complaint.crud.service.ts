import status from "http-status";
import type { Prisma } from "../../../../prisma/generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import AppError from "../../../utils/AppError";
import type {
	IAuthUser,
	ICreateComplaintPayload,
	IUpdateComplaintPayload,
	TPriority,
	TStatus,
} from "../complaint.interface";
import {
	buildMeta,
	getPagination,
	PRIORITIES,
	SORT_FIELDS,
	STATUSES,
	visibilityFilter,
} from "./complaint.shared";

const EDITABLE_STATUSES: string[] = ["PENDING_PAYMENT", "PENDING"];

const createComplaint = async (
	user: IAuthUser,
	payload: ICreateComplaintPayload,
) => {
	const category = await prisma.category.findUnique({
		where: { id: payload.categoryId },
	});
	if (!category || !category.isActive) {
		throw new AppError(status.NOT_FOUND, "Category not found");
	}

	// fee থাকলে paid service request, payment-এর আগে কাজ শুরু হবে না
	const needsPayment = category.serviceFee !== null;
	const initialStatus = needsPayment ? "PENDING_PAYMENT" : "PENDING";

	return prisma.complaint.create({
		data: {
			type: needsPayment ? "SERVICE_REQUEST" : "COMPLAINT",
			title: payload.title,
			description: payload.description,
			address: payload.address,
			latitude: payload.latitude,
			longitude: payload.longitude,
			priority: payload.priority ?? "MEDIUM",
			status: initialStatus,
			categoryId: category.id,
			departmentId: category.departmentId,
			citizenId: user.id,
			
			dueAt: needsPayment
				? null
				: new Date(Date.now() + category.slaHours * 60 * 60 * 1000),
			statusHistory: {
				create: {
					fromStatus: null,
					toStatus: initialStatus,
					note: "Complaint submitted",
					changedById: user.id,
				},
			},
		},
		include: {
			category: { select: { id: true, name: true, serviceFee: true } },
			department: { select: { id: true, name: true } },
		},
	});
};

const getAllComplaints = async (
	user: IAuthUser,
	query: Record<string, unknown>,
) => {
	const { page, limit, skip } = getPagination(query);

	const sortBy = SORT_FIELDS.includes(query.sortBy as never)
		? (query.sortBy as (typeof SORT_FIELDS)[number])
		: "createdAt";
	const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

	const where: Prisma.ComplaintWhereInput = {
		deletedAt: null,
		...(await visibilityFilter(user)),
	};

	if (STATUSES.includes(query.status as TStatus)) {
		where.status = query.status as TStatus;
	}
	if (PRIORITIES.includes(query.priority as TPriority)) {
		where.priority = query.priority as TPriority;
	}
	if (typeof query.categoryId === "string") {
		where.categoryId = query.categoryId;
	}
	if (typeof query.search === "string" && query.search.trim()) {
		const q = query.search.trim();
		where.OR = [
			{ title: { contains: q, mode: "insensitive" } },
			{ description: { contains: q, mode: "insensitive" } },
			{ address: { contains: q, mode: "insensitive" } },
		];
	}

	const [data, total] = await Promise.all([
		prisma.complaint.findMany({
			where,
			skip,
			take: limit,
			orderBy: { [sortBy]: sortOrder },
			select: {
				id: true,
				title: true,
				type: true,
				status: true,
				priority: true,
				address: true,
				dueAt: true,
				createdAt: true,
				category: { select: { id: true, name: true } },
				department: { select: { id: true, name: true } },
			},
		}),
		prisma.complaint.count({ where }),
	]);

	return { data, meta: buildMeta(page, limit, total) };
};

const getComplaintById = async (user: IAuthUser, id: string) => {
	const complaint = await prisma.complaint.findFirst({
		where: { id, deletedAt: null, ...(await visibilityFilter(user)) },
		include: {
			category: { select: { id: true, name: true, slaHours: true } },
			department: { select: { id: true, name: true } },
			citizen: { select: { id: true, name: true, email: true } },
			attachments: true,
			statusHistory: { orderBy: { createdAt: "asc" } },
		},
	});

	if (!complaint) {
		throw new AppError(status.NOT_FOUND, "Complaint not found");
	}
	return complaint;
};


const findOwnEditableComplaint = async (user: IAuthUser, id: string) => {
	const complaint = await prisma.complaint.findFirst({
		where: { id, citizenId: user.id, deletedAt: null },
	});
	if (!complaint) {
		throw new AppError(status.NOT_FOUND, "Complaint not found");
	}
	if (!EDITABLE_STATUSES.includes(complaint.status)) {
		throw new AppError(
			status.CONFLICT,
			`Complaint cannot be changed once it is ${complaint.status}`,
		);
	}
	return complaint;
};

const updateComplaint = async (
	user: IAuthUser,
	id: string,
	payload: IUpdateComplaintPayload,
) => {
	await findOwnEditableComplaint(user, id);

	return prisma.complaint.update({
		where: { id },
		data: payload,
		select: {
			id: true,
			title: true,
			description: true,
			address: true,
			latitude: true,
			longitude: true,
			status: true,
			updatedAt: true,
		},
	});
};

const deleteComplaint = async (user: IAuthUser, id: string) => {
	const complaint = await findOwnEditableComplaint(user, id);


	await prisma.$transaction([
		prisma.complaint.update({
			where: { id },
			data: { deletedAt: new Date(), status: "CANCELLED" },
		}),
		prisma.complaintStatusHistory.create({
			data: {
				complaintId: id,
				fromStatus: complaint.status,
				toStatus: "CANCELLED",
				note: "Deleted by citizen",
				changedById: user.id,
			},
		}),
	]);

	return null;
};

export const ComplaintCrudService = {
	createComplaint,
	getAllComplaints,
	getComplaintById,
	updateComplaint,
	deleteComplaint,
};