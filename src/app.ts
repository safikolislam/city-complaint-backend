import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", (req:Request, res:Response) => {
	res.send("city-complaint-server is running");
});




export default app;
