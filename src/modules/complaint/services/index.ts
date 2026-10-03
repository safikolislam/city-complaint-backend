import { ComplaintAssignedService } from "./complaint.assigned.service";
import { ComplaintCrudService } from "./complaint.crud.service";
import { ComplaintWorkflowService } from "./complaint.workflow.service";


export const ComplaintService = {
	...ComplaintCrudService,
	...ComplaintWorkflowService,
	...ComplaintAssignedService,
};