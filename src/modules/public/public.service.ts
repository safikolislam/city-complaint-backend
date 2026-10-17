import { prisma } from "../../lib/prisma";

const getPublicStats = async () => {
	const [
		citizens,
		officers,
		technicians,
		totalComplaints,
		resolvedComplaints,
		departments,
	] = await Promise.all([
		prisma.user.count({ where: { role: "CITIZEN", deletedAt: null } }),
		prisma.user.count({
			where: { role: "STAFF", staffPosition: "OFFICER", deletedAt: null },
		}),
		prisma.user.count({
			where: { role: "STAFF", staffPosition: "TECHNICIAN", deletedAt: null },
		}),
		prisma.complaint.count({ where: { deletedAt: null } }),
		prisma.complaint.count({
			where: { deletedAt: null, status: { in: ["RESOLVED", "CLOSED"] } },
		}),
		prisma.department.count(),
	]);

	return {
		citizens,
		officers,
		technicians,
		totalComplaints,
		resolvedComplaints,
		departments,
	};
};

export const PublicService = {
	getPublicStats,
};