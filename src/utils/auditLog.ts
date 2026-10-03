import type { Prisma } from "../../prisma/generated/prisma/client";
import { prisma } from "../lib/prisma";

type TAuditInput = {
	actorId: string;
	action: string;
	entity: string;
	entityId: string;
	metadata?: Prisma.InputJsonValue;
	ipAddress?: string;
};

export const writeAuditLog = (input: TAuditInput) => {
	return prisma.auditLog.create({ data: input });
};
