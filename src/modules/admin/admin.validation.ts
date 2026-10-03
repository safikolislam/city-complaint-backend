import { z } from "zod";

const updateRoleSchema = z.object({
	body: z
		.object({
			role: z.enum(["CITIZEN", "STAFF", "ADMIN"]),
			staffPosition: z.enum(["OFFICER", "TECHNICIAN", "MANAGER"]).optional(),
			departmentId: z.uuid().optional(),
		})
		.refine((d) => d.role !== "STAFF" || (d.staffPosition && d.departmentId), {
			message: "STAFF requires staffPosition and departmentId",
		}),
});

export const AdminValidation = { updateRoleSchema };