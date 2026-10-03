import type { Prisma } from "../../../../prisma/generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import type { IAuthUser, TStatus } from "../complaint.interface";
import { buildMeta, getPagination, STATUSES } from "./complaint.shared";

const getMyAssigned = async (
	user: IAuthUser,
	query: Record<string, unknown>,
) => {
	const { page, limit, skip } = getPagination(query);

	const where: Prisma.ComplaintWhereInput = {
		deletedAt: null,
		OR: [{ staffId: user.id }, { technicianId: user.id }],
	};
	if (STATUSES.includes(query.status as TStatus)) {
		where.status = query.status as TStatus;
	}

	const [data, total] = await Promise.all([
		prisma.complaint.findMany({
			where,
			skip,
			take: limit,
			orderBy: { dueAt: "asc" },
			select: {
				id: true,
				title: true,
				status: true,
				priority: true,
				address: true,
				dueAt: true,
				category: { select: { id: true, name: true } },
			},
		}),
		prisma.complaint.count({ where }),
	]);

	return { data, meta: buildMeta(page, limit, total) };
};

export const ComplaintAssignedService = { getMyAssigned };