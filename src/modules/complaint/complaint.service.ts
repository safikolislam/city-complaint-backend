import status from "http-status";
import type { Prisma } from "../../../prisma/generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import type { IAuthUser, ICreateComplaintPayload } from "./complaint.interface";

const STATUSES = [
	"PENDING_PAYMENT",
	"PENDING",
	"ASSIGNED",
	"IN_PROGRESS",
	"RESOLVED",
	"CLOSED",
	"REOPENED",
	"REJECTED",
	"CANCELLED",
] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const SORT_FIELDS = ["createdAt", "dueAt", "priority", "status"] as const;

type TStatus = (typeof STATUSES)[number];
type TPriority = (typeof PRIORITIES)[number];

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


const visibilityFilter = async (
	user: IAuthUser,
): Promise<Prisma.ComplaintWhereInput> => {
	if (user.role === "ADMIN") return {};
	if (user.role === "CITIZEN") return { citizenId: user.id };

	const staff = await prisma.user.findUnique({
		where: { id: user.id },
		select: { departmentId: true },
	});
	if (!staff?.departmentId) {
		throw new AppError(status.FORBIDDEN, "Staff has no department assigned");
	}
	return { departmentId: staff.departmentId };
};

const getAllComplaints = async (
	user: IAuthUser,
	query: Record<string, unknown>,
) => {
	const page = Math.max(1, Number(query.page) || 1);
	const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
	const skip = (page - 1) * limit;

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
		where.OR = [
			{ title: { contains: query.search.trim(), mode: "insensitive" } },
			{ description: { contains: query.search.trim(), mode: "insensitive" } },
			{ address: { contains: query.search.trim(), mode: "insensitive" } },
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

	return {
		data,
		meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
	};
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

export const ComplaintService = {
	createComplaint,
	getAllComplaints,
	getComplaintById,
};