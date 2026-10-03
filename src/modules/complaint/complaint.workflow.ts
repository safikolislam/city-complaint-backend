import type { TStatus } from "./complaint.interface";

export const TRANSITIONS: Record<TStatus, TStatus[]> = {
	PENDING_PAYMENT: ["PENDING", "CANCELLED"],
	PENDING: ["ASSIGNED", "REJECTED", "CANCELLED"],
	ASSIGNED: ["IN_PROGRESS", "REJECTED"],
	IN_PROGRESS: ["RESOLVED"],
	RESOLVED: ["CLOSED", "REOPENED"],
	REOPENED: ["ASSIGNED", "IN_PROGRESS"],
	CLOSED: [],
	REJECTED: [],
	CANCELLED: [],
};

export const canTransition = (from: TStatus, to: TStatus) =>
	TRANSITIONS[from].includes(to);
