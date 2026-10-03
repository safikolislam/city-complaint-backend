import type { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchASync";
import { sendResponse } from "../../utils/sendResponse";
import { CategoryService } from "./category.service";

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
	const departmentId =
		typeof req.query.departmentId === "string"
			? req.query.departmentId
			: undefined;
	const data = await CategoryService.getAllCategories(departmentId);
	sendResponse(res, {
		statusCode: status.OK,
		message: "Categories retrieved successfully",
		data,
	});
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
	const data = await CategoryService.getCategoryById(String(req.params.id));
	sendResponse(res, {
		statusCode: status.OK,
		message: "Category retrieved successfully",
		data,
	});
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
	const data = await CategoryService.createCategory(req.user!.id, req.body);
	sendResponse(res, {
		statusCode: status.CREATED,
		message: "Category created successfully",
		data,
	});
});

const getAllDepartments = catchAsync(async (_req: Request, res: Response) => {
	const data = await CategoryService.getAllDepartments();
	sendResponse(res, {
		statusCode: status.OK,
		message: "Departments retrieved successfully",
		data,
	});
});

export const CategoryController = {
	getAllCategories,
	getCategoryById,
	createCategory,
	getAllDepartments,
};
