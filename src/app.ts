import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import config from "./config";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import { authRoutes } from "./modules/auth/auth.route";
import { UserRoutes } from "./modules/user/user.route";

const app: Application = express();
app.use(
	cors({
		origin: config.app_url,
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
	res.send("city-complaint-server is running");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users",UserRoutes)
app.use(globalErrorHandler);
export default app;
