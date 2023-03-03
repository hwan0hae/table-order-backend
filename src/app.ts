import express, { Request, Response } from "express";

const app = express();

app.get("/welcome", (req: Request, res: Response) => {
  res.send("welcome!");
});

app.listen(8080);
