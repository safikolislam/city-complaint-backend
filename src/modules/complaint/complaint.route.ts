import { Router } from "express";
import auth from "../../middlewares/auth/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ComplaintController } from "./complaint.controller";
import { ComplaintValidation } from "./complaint.validation";

const router = Router();

router.post(
	"/",
	auth("CITIZEN"),
	validateRequest(ComplaintValidation.createComplaintSchema),
	ComplaintController.createComplaint,
);

router.get("/", auth(), ComplaintController.getAllComplaints);


router.get("/my-assigned", auth("STAFF"), ComplaintController.getMyAssigned);
router.get("/technicians", auth("STAFF"), ComplaintController.getTechnicians);

router.get("/:id", auth(), ComplaintController.getComplaintById);

router.patch(
	"/:id",
	auth("CITIZEN"),
	validateRequest(ComplaintValidation.updateComplaintSchema),
	ComplaintController.updateComplaint,
);

router.delete("/:id", auth("CITIZEN"), ComplaintController.deleteComplaint);

router.post(
	"/:id/assign",
	auth("STAFF", "ADMIN"),
	validateRequest(ComplaintValidation.assignComplaintSchema),
	ComplaintController.assignComplaint,
);

router.patch(
	"/:id/status",
	auth("STAFF", "ADMIN", "CITIZEN"),
	validateRequest(ComplaintValidation.changeStatusSchema),
	ComplaintController.changeStatus,
);

router.post(
	"/:id/cancel",
	auth("CITIZEN"),
	validateRequest(ComplaintValidation.cancelSchema),
	ComplaintController.cancelComplaint,
);

export const complaintRoutes = router;
