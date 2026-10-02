import jwt, { type SignOptions } from "jsonwebtoken";

export type TJwtPayload = {
	id: string;
	role: "CITIZEN" | "STAFF" | "ADMIN";
};

export const createToken = (
	payload: TJwtPayload,
	secret: string,
	expiresIn: string,
) => {
	return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

export const verifyToken = (token: string, secret: string) => {
	return jwt.verify(token, secret) as TJwtPayload;
};
