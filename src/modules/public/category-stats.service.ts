import { prisma } from "../../lib/prisma";

export const getCategoryStats = async () => {
	const [categories, grouped] = await Promise.all([
		prisma.category.findMany({
			where: { isActive: true },
			select: { id: true, name: true },
			orderBy: { name: "asc" },
		}),
		prisma.complaint.groupBy({
			by: ["categoryId"],
			where: {
				status: { notIn: ["PENDING_PAYMENT", "CANCELLED"] },
			},
			_count: { _all: true },
		}),
	]);

	const countMap = new Map(grouped.map((g) => [g.categoryId, g._count._all]));

	return categories.map((c) => ({
		id: c.id,
		name: c.name,
		count: countMap.get(c.id) ?? 0,
	}));
};