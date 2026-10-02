
import cookieParser from "cookie-parser";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";

import { authRoutes } from "./modules/auth/auth.route";
import globalErrorHandler from "./middlewares/globalErrorHandler";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
	res.send("city-complaint-server is running");
});

app.use("/api/v1/auth",authRoutes)
app.use(globalErrorHandler)
export default app;
