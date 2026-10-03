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
router.get("/:id", auth(), ComplaintController.getComplaintById);
router.patch(
	"/:id",
	auth("CITIZEN"),
	validateRequest(ComplaintValidation.updateComplaintSchema),
	ComplaintController.updateComplaint,
);

router.delete("/:id", auth("CITIZEN"), ComplaintController.deleteComplaint);
export const complaintRoutes = router;