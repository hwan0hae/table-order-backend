import express, { Request, Response } from 'express';
import validate, {
  menuAddCheck,
  menuDeleteCheck,
  menuEditCheck,
} from '../../../middleware/validator';
import client from '../../../db/db';
import authChecker from '../../../middleware/auth';
import { imageDeleteCommand, imageUploader } from '../../../middleware/multer';
import {
  IProductAddData,
  IProductData,
  IProductEditData,
} from '../../../types/api';

const MenuRouter = express.Router();

const multer = imageUploader.single('image');

/** 메뉴 리스트 get 요청 */
MenuRouter.get('/list', authChecker, async (req: Request, res: Response) => {
  const user = req.currentUser;

  try {
    const result = await client.query(
      `SELECT id,name,price,description,image_url as "imageUrl"
       FROM product
      WHERE company_id=${user?.company_id}
      ORDER BY created_at ASC`
    );
    const menuList: IProductData[] = result.rows;
    return res.status(200).json(menuList);
  } catch (error: unknown) {
    console.error('/api/v1/web/menu/list >> ', error);

    return res.status(400).json({
      error,
      message: '데이터를 불러오지 못했습니다.',
    });
  }
});

/** 메뉴 추가 */
MenuRouter.post(
  '/add',
  authChecker,
  multer,
  ...validate(menuAddCheck),
  async (req: Request, res: Response) => {
    const user = req.currentUser;
    const { body, file } = req;
    const data: IProductAddData = { ...body, price: Number(body.price) };

    let imageUrl = '';
    try {
      if (file) imageUrl = (file as Express.MulterS3.File).location;

      await client.query(
        `INSERT INTO product (name, price, description, image_url, company_id, creator_id)
      VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          data.name,
          data.price,
          data.description,
          imageUrl,
          user?.company_id,
          user?.id,
        ]
      );

      return res.status(200).json({
        message: '메뉴가 추가되었습니다.',
      });
    } catch (error: any) {
      console.error('/api/v1/web/menu/add >> ', error);

      return res.status(500).json({
        message: '뭔가 에러가떴습니당 !',
      });
    }
  }
);

/** 메뉴 수정 */
MenuRouter.post(
  '/edit',
  ...validate(menuEditCheck),
  authChecker,
  multer,
  async (req: Request, res: Response) => {
    const user = req.currentUser;
    const { body, file } = req;
    const data: IProductEditData = {
      ...body,
      id: Number(body.id),
      price: Number(body.price),
    };

    try {
      if (file) {
        const imageUrl = (file as Express.MulterS3.File).location;

        const prvImageUrlResult = await client.query(
          `SELECT image_url FROM product WHERE id=${data.id}`
        );
        const prvImageUrl = prvImageUrlResult.rows[0].image_url;

        if (prvImageUrl !== '') {
          const path = prvImageUrl.substring(
            prvImageUrl.indexOf(`${user?.company_id}/menu`)
          );
          await imageDeleteCommand(path);
        }

        await client.query(
          `UPDATE product
        SET name='${data.name}', price=${data.price}, description='${data.description}',image_url='${imageUrl}',updated_at=now()
        WHERE id=${data.id}`
        );

        return res.status(200).json({
          message: '메뉴가 수정되었습니다.',
        });
      }

      await client.query(
        `UPDATE product
      SET name='${data.name}', price=${data.price}, description='${data.description}',updated_at=now()
      WHERE id=${data.id}`
      );

      return res.status(200).json({
        message: '메뉴가 수정되었습니다.',
      });
    } catch (error: any) {
      console.error('/api/v1/web/menu/edit >> ', error);

      return res.status(500).json({
        message: '뭔가 에러가떴습니당 !',
      });
    }
  }
);

/** 메뉴 삭제 */
MenuRouter.post(
  '/delete',
  ...validate(menuDeleteCheck),
  authChecker,
  async (req: Request, res: Response) => {
    const user = req.currentUser;
    const { id }: { id: number } = req.body;
    try {
      const imageUrlResult = await client.query(
        `SELECT image_url FROM product WHERE id=${id}`
      );
      const imageUrl = imageUrlResult.rows[0].image_url;

      if (imageUrl !== '') {
        const path = imageUrl.substring(
          imageUrl.indexOf(`${user?.company_id}/menu`)
        );
        await imageDeleteCommand(path);
      }

      await client.query(`DELETE FROM product WHERE id=${id}`);

      return res.status(200).json({
        message: '메뉴가 삭제되었습니다.',
      });
    } catch (error: any) {
      console.error('/api/v1/web/menu/delete >> ', error);

      return res.status(500).json({
        message: '메뉴 삭제에 실패 하였습니다.',
      });
    }
  }
);

export default MenuRouter;
