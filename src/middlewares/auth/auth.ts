import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { verifyToken } from "../../utils/jwt";

export type TRole = "CITIZEN" | "STAFF" | "ADMIN";

declare global {
	namespace Express {
		interface Request {
			user?: { id: string; role: TRole };
		}
	}
}

const auth = (...allowedRoles: TRole[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const header = req.headers.authorization;

			if (!header || !header.startsWith("Bearer ")) {
				throw new AppError(status.UNAUTHORIZED, "Authorization token missing");
			}

			const token = header.split(" ")[1];

			let decoded: { id: string };
			try {
				decoded = verifyToken(token, config.jwt_access_secret as string) as {
					id: string;
				};
			} catch (err) {
				const message =
					(err as Error).name === "TokenExpiredError"
						? "Access token expired"
						: "Invalid access token";
				throw new AppError(status.UNAUTHORIZED, message);
			}

			const user = await prisma.user.findUnique({
				where: { id: decoded.id },
				select: { id: true, role: true, isActive: true, deletedAt: true },
			});

			if (!user || user.deletedAt || !user.isActive) {
				throw new AppError(status.UNAUTHORIZED, "User not found or inactive");
			}

			if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
				throw new AppError(
					status.FORBIDDEN,
					"You do not have permission to access this resource",
				);
			}

			req.user = { id: user.id, role: user.role };
			next();
		} catch (error) {
			next(error);
		}
	};
};

export default auth;
