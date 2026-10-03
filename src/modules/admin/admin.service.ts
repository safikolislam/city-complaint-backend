import status from "http-status";
import type { Prisma } from "../../../prisma/generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";


const ROLES = ["CITIZEN", "STAFF", "ADMIN"] as const;
type TRole = (typeof ROLES)[number];

const getAllUsers = async (query: Record<string, unknown>) => {
	const page = Math.max(1, Number(query.page) || 1);
	const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));

	const where: Prisma.UserWhereInput = { deletedAt: null };
	if (ROLES.includes(query.role as TRole)) where.role = query.role as TRole;
	if (typeof query.search === "string" && query.search.trim()) {
		where.OR = [
			{ name: { contains: query.search.trim(), mode: "insensitive" } },
			{ email: { contains: query.search.trim(), mode: "insensitive" } },
		];
	}

	const [data, total] = await Promise.all([
		prisma.user.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				role: true,
				staffPosition: true,
				isActive: true,
				department: { select: { id: true, name: true } },
				createdAt: true,
			},
		}),
		prisma.user.count({ where }),
	]);

	return {
		data,
		meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
	};
};

const updateUserRole = async (
	actorId: string,
	targetId: string,
	payload: {
		role: TRole;
		staffPosition?: "OFFICER" | "TECHNICIAN" | "MANAGER";
		departmentId?: string;
	},
) => {
	if (actorId === targetId) {
		throw new AppError(status.BAD_REQUEST, "You cannot change your own role");
	}

	const target = await prisma.user.findFirst({
		where: { id: targetId, deletedAt: null },
	});
	if (!target) throw new AppError(status.NOT_FOUND, "User not found");

	if (payload.departmentId) {
		const dept = await prisma.department.findUnique({
			where: { id: payload.departmentId },
		});
		if (!dept) throw new AppError(status.NOT_FOUND, "Department not found");
	}

	const isStaff = payload.role === "STAFF";

	
	const [updated] = await prisma.$transaction([
		prisma.user.update({
			where: { id: targetId },
			data: {
				role: payload.role,
				staffPosition: isStaff ? payload.staffPosition : null,
				departmentId: isStaff ? payload.departmentId : null,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				staffPosition: true,
				departmentId: true,
			},
		}),
		prisma.auditLog.create({
			data: {
				actorId,
				action: "ROLE_CHANGED",
				entity: "User",
				entityId: targetId,
				metadata: {
					from: { role: target.role, staffPosition: target.staffPosition },
					to: { role: payload.role, staffPosition: payload.staffPosition },
				},
			},
		}),
	]);

	return updated;
};

const getAuditLogs = async (query: Record<string, unknown>) => {
	const page = Math.max(1, Number(query.page) || 1);
	const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

	const where: Prisma.AuditLogWhereInput = {};
	if (typeof query.entity === "string") where.entity = query.entity;
	if (typeof query.action === "string") where.action = query.action;
	if (typeof query.actorId === "string") where.actorId = query.actorId;

	const [data, total] = await Promise.all([
		prisma.auditLog.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: { actor: { select: { id: true, name: true, email: true } } },
		}),
		prisma.auditLog.count({ where }),
	]);

	return {
		data,
		meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
	};
};

const getDashboardStats = async () => {
	const [totalComplaints, byStatus, byDepartment, overdue, totalUsers] =
		await Promise.all([
			prisma.complaint.count({ where: { deletedAt: null } }),
			prisma.complaint.groupBy({
				by: ["status"],
				where: { deletedAt: null },
				_count: { _all: true },
			}),
			prisma.complaint.groupBy({
				by: ["departmentId"],
				where: { deletedAt: null },
				_count: { _all: true },
			}),
			prisma.complaint.count({
				where: {
					deletedAt: null,
					dueAt: { lt: new Date() },
					status: { in: ["PENDING", "ASSIGNED", "IN_PROGRESS", "REOPENED"] },
				},
			}),
			prisma.user.count({ where: { deletedAt: null } }),
		]);

	const departments = await prisma.department.findMany({
		select: { id: true, name: true },
	});
	const deptName = new Map(departments.map((d) => [d.id, d.name]));

	return {
		totalComplaints,
		totalUsers,
		overdueComplaints: overdue,
		byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
		byDepartment: byDepartment.map((d) => ({
			department: deptName.get(d.departmentId) ?? d.departmentId,
			count: d._count._all,
		})),
	};
};

export const AdminService = {
	getAllUsers,
	updateUserRole,
	getAuditLogs,
	getDashboardStats,
};