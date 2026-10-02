import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";

const profileSelect = {
	id: true,
	name: true,
	email: true,
	phone: true,
	role: true,
	createdAt: true,
	updatedAt: true,
} as const;

const getMe = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: profileSelect,
	});

	if (!user) {
		throw new AppError(status.NOT_FOUND, "User not found");
	}

	return user;
};

const updateMe = async (
	userId: string,
	payload: { name?: string; phone?: string },
) => {
	return prisma.user.update({
		where: { id: userId },
		data: payload,
		select: profileSelect,
	});
};

export const UserService = { getMe, updateMe };