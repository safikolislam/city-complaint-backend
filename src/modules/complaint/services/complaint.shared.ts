import status from "http-status";
import type { Prisma } from "../../../../prisma/generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import AppError from "../../../utils/AppError";
import type { IAuthUser, TPriority, TStatus } from "../complaint.interface";

export const STATUSES: TStatus[] = [
	"PENDING_PAYMENT",
	"PENDING",
	"ASSIGNED",
	"IN_PROGRESS",
	"RESOLVED",
	"CLOSED",
	"REOPENED",
	"REJECTED",
	"CANCELLED",
];
export const PRIORITIES: TPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
export const SORT_FIELDS = [
	"createdAt",
	"dueAt",
	"priority",
	"status",
] as const;


export const getPagination = (
	query: Record<string, unknown>,
	defaultLimit = 10,
) => {
	const page = Math.max(1, Number(query.page) || 1);
	const limit = Math.min(100, Math.max(1, Number(query.limit) || defaultLimit));
	return { page, limit, skip: (page - 1) * limit };
};

export const buildMeta = (page: number, limit: number, total: number) => ({
	page,
	limit,
	total,
	totalPage: Math.ceil(total / limit),
});


export const visibilityFilter = async (
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

export const getStaffProfile = async (userId: string) => {
	const u = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, role: true, staffPosition: true, departmentId: true },
	});
	if (!u) throw new AppError(status.NOT_FOUND, "User not found");
	return u;
};
