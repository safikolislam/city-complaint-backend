import bcrypt from "bcryptjs";
import status from "http-status";

import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { createToken } from "../../utils/jwt";
import type { ILoginPayload, IRegisterPayload } from "./auth.interface";
import config from "../../config";

const registerUserIntoDB = async (payload: IRegisterPayload) => {
	const { name, email, password, phone } = payload;

	const isUserExist = await prisma.user.findUnique({ where: { email } });
	if (isUserExist) {
		throw new AppError(status.CONFLICT, "User with this email already exists");
	}

	const passwordHash = await bcrypt.hash(
		password,
		Number(config.bcrypt_salt_rounds),
	);

	return prisma.user.create({
		data: { name, email, phone, passwordHash },
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			role: true,
			createdAt: true,
		},
	});
};

const loginUser = async (payload: ILoginPayload) => {
	const user = await prisma.user.findUnique({
		where: { email: payload.email },
	});


	if (!user || user.deletedAt || !user.isActive) {
		throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
	}

	const isPasswordMatched = await bcrypt.compare(
		payload.password,
		user.passwordHash,
	);
	if (!isPasswordMatched) {
		throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
	}

	const tokenPayload = { id: user.id, role: user.role };

	const accessToken = createToken(
		tokenPayload,
		config.jwt_access_secret as string,
		config.jwt_access_expires_in as string,
	);
	const refreshToken = createToken(
		tokenPayload,
		config.jwt_refresh_secret as string,
		config.jwt_refresh_expires_in as string,
	);

	return {
		accessToken,
		refreshToken,
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
		},
	};
};

export const AuthService = {
	registerUserIntoDB,
	loginUser,
};