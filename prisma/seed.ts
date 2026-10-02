import "dotenv/config";
import bcrypt from "bcryptjs";
import config from "../src/config";
import { prisma } from "../src/lib/prisma";

const seedAdmin = async () => {
	const email = process.env.SEED_ADMIN_EMAIL;
	const password = process.env.SEED_ADMIN_PASSWORD;

	if (!email || !password) {
		throw new Error
	}

	const passwordHash = await bcrypt.hash(
		password,
		Number(config.bcrypt_salt_rounds),
	);

	const admin = await prisma.user.upsert({
		where: { email },
		update: { role: "ADMIN", isActive: true, deletedAt: null },
		create: {
			name: process.env.SEED_ADMIN_NAME ?? "City Admin",
			email,
			passwordHash,
			role: "ADMIN",
		},
		select: { id: true, email: true, role: true },
	});

	console.log("Admin ready:", admin.email, `(${admin.role})`);
};

const main = async () => {
	await seedAdmin();
};

main()
	.catch((error) => {
		console.error("Seeding failed:", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});