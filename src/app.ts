import express from "express";
import http from "http";
import socketIO, { Socket } from "socket.io";
import cors from "cors";
import { getMenu } from "./controller/menu";
import { order } from "./controller/order";

const app = express();
const server = http.createServer(app);

const io = new socketIO.Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export const socketArr = new Array<Socket>();

io.on("connection", (socket) => {
  socketArr.push(socket);
  console.log("New client connected");

  socket.on("disconnect", () => console.log("user disconnect", socket.id));

  socket.on("error", (error) => {
    console.error(error);
  });
});

app.use(cors());
app.use(express.json());

app.get("/api/menu", getMenu);
app.post("/api/order", order);

const port = process.env.PORT;
server.listen(port);
