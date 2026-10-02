import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import { Prisma } from "../../prisma/generated/prisma/client";
import AppError from "../utils/AppError";


const globalErrorHandler = (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	let statusCode: number = status.INTERNAL_SERVER_ERROR;
	let message = "Internal Server Error";

	if (err instanceof AppError) {
		statusCode = err.statusCode;
		message = err.message;
	} else if (err instanceof Prisma.PrismaClientValidationError) {
		statusCode = status.BAD_REQUEST;
		message = "Incorrect field type or missing fields";
	} else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === "P2002") {
			statusCode = status.CONFLICT;
			message = "Duplicate key error";
		} else if (err.code === "P2003") {
			statusCode = status.BAD_REQUEST;
			message = "Foreign key constraint failed";
		} else if (err.code === "P2025") {
			statusCode = status.NOT_FOUND;
			message = "Record not found";
		}
	} else if (err instanceof Prisma.PrismaClientInitializationError) {
		statusCode = status.SERVICE_UNAVAILABLE;
		message = "Can't reach database server";
	} else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
		message = "Error occurred during query execution";
	}

	if (statusCode === status.INTERNAL_SERVER_ERROR) {
		console.error(err);
	}

	res.status(statusCode).json({
		success: false,
		message,
		errors: [],
		...(process.env.NODE_ENV === "development" && err instanceof Error
			? { stack: err.stack }
			: {}),
	});
};

export default globalErrorHandler;