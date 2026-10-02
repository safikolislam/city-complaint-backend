import type { Response } from "express";

type TMeta = {
	page?: number;
	limit?: number;
	total?: number;
	totalPage?: number;
};

type TResponseData<T> = {
	statusCode: number;
	success: boolean;
	message?: string;
	meta?: TMeta;
	data: T;
};

export const sendResponse = <T>(res: Response, data: TResponseData<T>) => {
	res.status(data.statusCode).json({
		success: data.success,
		statusCode: data.statusCode,
		message: data.message,
		meta: data.meta || null,
		data: data.data,
	});
};
