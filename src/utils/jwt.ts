import type { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

const createToken = (
	payload: JwtPayload,
	secret: string,
	expiresIn: SignOptions,
) => {
	const token = jwt.sign(payload, secret, { expiresIn } as SignOptions);
	return token;
};

const verifyToken = (token: string, secret: string) => {
	try {
		const verifiedToken = jwt.verify(token, secret);
		return verifiedToken;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const jwtUtils = {
	createToken,
	verifyToken,
};
