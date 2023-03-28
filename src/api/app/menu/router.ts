import express, { Request, Response } from 'express';
import appAuthChecker from '../../../middleware/appAuth';
import client from '../../../db/db';
import { ITable } from '../../../types/data';

// auth 미들웨어
const MenuRouter = express.Router();

MenuRouter.get('/list', appAuthChecker, async (req: Request, res: Response) => {
  // 임의값 부여
  try {
    const table = req.appCurrentTable;

    const result = await client.query(
      `SELECT id, name, price, description, image_url as "imageUrl"
      FROM product 
      WHERE company_id = ${table.company_id}
      ORDER BY created_at ASC`
    );
    const menuList = result.rows;
    return res.status(200).json(menuList);
  } catch (error: any) {
    console.error('/api/v1/app/menu/list >> ', error);

    return res.status(400).json({
      error,
      message: '데이터를 불러오지 못했습니다.',
    });
  }
});

export default MenuRouter;
