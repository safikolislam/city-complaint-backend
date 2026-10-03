export type TRole = "CITIZEN" | "STAFF" | "ADMIN";

export type TStatus =
	| "PENDING_PAYMENT"
	| "PENDING"
	| "ASSIGNED"
	| "IN_PROGRESS"
	| "RESOLVED"
	| "CLOSED"
	| "REOPENED"
	| "REJECTED"
	| "CANCELLED";

export type TPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface IAuthUser {
	id: string;
	role: TRole;
}

export interface ICreateComplaintPayload {
	title: string;
	description: string;
	address: string;
	categoryId: string;
	priority?: TPriority;
	latitude?: number;
	longitude?: number;
}

export interface IUpdateComplaintPayload {
	title?: string;
	description?: string;
	address?: string;
	latitude?: number;
	longitude?: number;
}

export interface IAssignPayload {
	staffId?: string;
	technicianId?: string;
}

export interface IChangeStatusPayload {
	status: TStatus;
	note?: string;
}
