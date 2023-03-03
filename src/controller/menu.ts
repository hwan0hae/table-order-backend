import { Request, Response } from "express";
import prisma from "../../prisma/prismaClient";
export const getMenu = async (req: Request, res: Response) => {
  try {
    //임의 값 부여
    const companyId = 6;

    const list = await prisma.product.findMany({
      where: {
        companyId,
      },
    });
    return res.status(200).json(list);
  } catch (error) {
    console.error("/api/menu >> ", error);

    res.status(400).json({ error, message: "데이터를 불러오지 못했습니다." });
  }
};
