import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import status from "http-status";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { createToken, hashToken, verifyToken } from "../../utils/jwt";
import type { ILoginPayload, IRegisterPayload } from "./auth.interface";

const REFRESH_TOKEN_MS = 7 * 24 * 60 * 60 * 1000;

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

	await prisma.refreshToken.create({
		data: {
			tokenHash: hashToken(refreshToken),
			userId: user.id,
			expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
		},
	});

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

const loginWithGoogle = async (idToken: string) => {
	let googleUser: { email: string; name: string };

	try {
		const ticket = await googleClient.verifyIdToken({
			idToken,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const data = ticket.getPayload();

		if (!data?.email || !data.email_verified) {
			throw new Error("Email not verified");
		}
		googleUser = { email: data.email, name: data.name ?? data.email };
	} catch {
		throw new AppError(status.UNAUTHORIZED, "Invalid Google token");
	}

	let user = await prisma.user.findUnique({
		where: { email: googleUser.email },
	});

	if (!user) {
		const passwordHash = await bcrypt.hash(
			randomUUID(),
			Number(config.bcrypt_salt_rounds),
		);
		user = await prisma.user.create({
			data: { name: googleUser.name, email: googleUser.email, passwordHash },
		});
	}

	if (user.deletedAt || !user.isActive) {
		throw new AppError(status.UNAUTHORIZED, "User not found or inactive");
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

	await prisma.refreshToken.create({
		data: {
			tokenHash: hashToken(refreshToken),
			userId: user.id,
			expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
		},
	});

	return {
		accessToken,
		refreshToken,
		user: { id: user.id, name: user.name, email: user.email, role: user.role },
	};
};

const refreshAccessToken = async (token?: string) => {
	if (!token) {
		throw new AppError(status.UNAUTHORIZED, "Refresh token missing");
	}

	let decoded: ReturnType<typeof verifyToken>;
	try {
		decoded = verifyToken(token, config.jwt_refresh_secret as string);
	} catch {
		throw new AppError(status.UNAUTHORIZED, "Invalid or expired refresh token");
	}

	const stored = await prisma.refreshToken.findUnique({
		where: { tokenHash: hashToken(token) },
	});

	if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
		throw new AppError(status.UNAUTHORIZED, "Invalid or expired refresh token");
	}

	const user = await prisma.user.findUnique({ where: { id: decoded.id } });
	if (!user || user.deletedAt || !user.isActive) {
		throw new AppError(status.UNAUTHORIZED, "User not found or inactive");
	}

	const tokenPayload = { id: user.id, role: user.role };

	const accessToken = createToken(
		tokenPayload,
		config.jwt_access_secret as string,
		config.jwt_access_expires_in as string,
	);
	const newRefreshToken = createToken(
		tokenPayload,
		config.jwt_refresh_secret as string,
		config.jwt_refresh_expires_in as string,
	);

	await prisma.$transaction([
		prisma.refreshToken.update({
			where: { id: stored.id },
			data: { revokedAt: new Date() },
		}),
		prisma.refreshToken.create({
			data: {
				tokenHash: hashToken(newRefreshToken),
				userId: user.id,
				expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
			},
		}),
	]);

	return { accessToken, refreshToken: newRefreshToken };
};

const logoutUser = async (token?: string) => {
	if (!token) return;

	await prisma.refreshToken.updateMany({
		where: { tokenHash: hashToken(token), revokedAt: null },
		data: { revokedAt: new Date() },
	});
};

export const AuthService = {
	registerUserIntoDB,
	loginUser,
	loginWithGoogle,
	refreshAccessToken,
	logoutUser,
};
