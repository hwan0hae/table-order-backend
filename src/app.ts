import express from "express";
import cors from "cors";
import { getMenu } from "./controller/menu";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/menu", getMenu);

const port = process.env.PORT;
app.listen(port);
