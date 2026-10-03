import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {

	const passwordHash = await bcrypt.hash("Admin@12345", 10);
	await prisma.user.upsert({
		where: { email: "admin@city.gov" },
		update: {},
		create: {
			name: "City Admin",
			email: "admin@city.gov",
			passwordHash,
			role: "ADMIN",
		},
	});
	console.log("Admin ready");


	const departments = [
		{
			name: "Water Supply",
			categories: [
				{ name: "Water Leakage", slaHours: 24 },
				{ name: "New Water Connection", slaHours: 120, serviceFee: 500 },
			],
		},
		{
			name: "Roads & Infrastructure",
			categories: [
				{ name: "Pothole", slaHours: 72 },
				{ name: "Streetlight Failure", slaHours: 48 },
			],
		},
		{
			name: "Waste Management",
			categories: [{ name: "Garbage Not Collected", slaHours: 24 }],
		},
	];

	for (const d of departments) {
		const dept = await prisma.department.upsert({
			where: { name: d.name },
			update: {},
			create: { name: d.name },
		});

		for (const c of d.categories) {
			await prisma.category.upsert({
				where: { name: c.name },
				update: {},
				create: { ...c, departmentId: dept.id },
			});
		}
		console.log(`Department ready: ${d.name}`);
	}

	console.log("Seed done");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());