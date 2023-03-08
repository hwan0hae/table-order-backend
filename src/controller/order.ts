import { Request, Response } from "express";
import { socketArr } from "../app";

export const order = async (req: Request, res: Response) => {
  try {
    socketArr.map((socket, index) => {
      socket.emit("orderData", req.body);
    });
    return res.status(200).json({ message: "주문이 완료 되었습니다." });
  } catch (error) {
    console.error("/api/order >> ", error);

    res.status(400).json({ error, message: "뭔가 에러가 떳씁니당." });
  }
};
