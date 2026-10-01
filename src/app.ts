import express, { Application, Request, Response } from "express";

const app: Application = express();
app.get("/", (req:Request, res:Response) => {
  res.send("city-complaint-server is running")
})
export default app;