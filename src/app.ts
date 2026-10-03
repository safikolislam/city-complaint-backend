import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import { adminRoutes } from "./modules/admin/admin.route";
import { authRoutes } from "./modules/auth/auth.route";
import { categoryRoutes } from "./modules/category/category.route";
import { complaintRoutes } from "./modules/complaint/complaint.route";
import { UserRoutes } from "./modules/user/user.route";


const app: Application = express();


app.set("trust proxy", 1);

app.use(helmet());
app.use(
	cors({
		origin: process.env.CLIENT_URL?.split(",") ?? true,
		credentials: true,
	}),
);


app.use(
	"/api",
	rateLimit({
		windowMs: 15 * 60 * 1000,
		limit: 300,
		standardHeaders: true,
		legacyHeaders: false,
		message: {
			success: false,
			message: "Too many requests, try later",
			errors: [],
		},
	}),
);


const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many attempts, try later",
		errors: [],
	},
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
	res.send("city-complaint-server is running");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/complaints", complaintRoutes);
app.use("/api/v1", categoryRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use(globalErrorHandler); // সবার শেষে

export default app;
