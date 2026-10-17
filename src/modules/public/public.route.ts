import { Router } from "express";
import { categoryStatsController } from "./category-stats.controller";
import { PublicController } from "./public.controller";

const router = Router();

router.get("/stats", PublicController.getPublicStats);
router.get("/stats/categories", categoryStatsController);

export const publicRoutes = router;