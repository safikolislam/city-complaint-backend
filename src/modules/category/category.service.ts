import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { writeAuditLog } from "../../utils/auditLog";

const getAllCategories = async (departmentId?: string) => {
	return prisma.category.findMany({
		where: { isActive: true, ...(departmentId ? { departmentId } : {}) },
		select: {
			id: true,
			name: true,
			description: true,
			slaHours: true,
			serviceFee: true,
			department: { select: { id: true, name: true } },
		},
		orderBy: { name: "asc" },
	});
};

const getCategoryById = async (id: string) => {
	const category = await prisma.category.findFirst({
		where: { id, isActive: true },
		include: { department: { select: { id: true, name: true } } },
	});
	if (!category) throw new AppError(status.NOT_FOUND, "Category not found");
	return category;
};

const createCategory = async (
	actorId: string,
	payload: {
		name: string;
		description?: string;
		slaHours: number;
		serviceFee?: number;
		departmentId: string;
	},
) => {
	const dept = await prisma.department.findUnique({
		where: { id: payload.departmentId },
	});
	if (!dept) throw new AppError(status.NOT_FOUND, "Department not found");

	const category = await prisma.category.create({ data: payload });

	await writeAuditLog({
		actorId,
		action: "CATEGORY_CREATED",
		entity: "Category",
		entityId: category.id,
		metadata: { name: category.name },
	});
	return category;
};

const getAllDepartments = async () => {
	return prisma.department.findMany({
		where: { isActive: true },
		select: { id: true, name: true, description: true },
		orderBy: { name: "asc" },
	});
};

export const CategoryService = {
	getAllCategories,
	getCategoryById,
	createCategory,
	getAllDepartments,
};
