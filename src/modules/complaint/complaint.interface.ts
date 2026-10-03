export interface ICreateComplaintPayload {
	title: string;
	description: string;
	address: string;
	categoryId: string;
	priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
	latitude?: number;
	longitude?: number;
}

export interface IAuthUser {
	id: string;
	role: "CITIZEN" | "STAFF" | "ADMIN";
}