import type { Response } from "express";

type TMeta = {
	page: number;
	limit: number;
	total: number;
	totalPage: number;
};

type TResponseData<T> = {
	statusCode: number;
	message: string;
	data: T;
	meta?: TMeta;
};

export const sendResponse = <T>(res: Response, payload: TResponseData<T>) => {
	res.status(payload.statusCode).json({
		success: true,
		message: payload.message,
		...(payload.meta ? { meta: payload.meta } : {}),
		data: payload.data,
	});
};
