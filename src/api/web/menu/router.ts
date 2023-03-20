import express, { Request, Response } from 'express';
import { client } from '../../../db/db';
import { auth } from '../../../middleware/auth';
import { imageDeleteCommand, imageUploader } from '../../../middleware/multer';
import { IProductData } from '../../../types/api';

export const MenuRouter = express.Router();

const multer = imageUploader.single('image');

/** 메뉴 리스트 get 요청 */
MenuRouter.get('/list', auth, async (req: Request, res: Response) => {
  const user = req.currentUser;

  try {
    const result = await client.query(
      `SELECT id,name,price,description,image_url
       FROM product
      WHERE company_id=${user?.company_id}
      ORDER BY created_at ASC`
    );
    const menuList: IProductData[] = result.rows;

    return res.status(200).json(menuList);
  } catch (error: any) {
    console.error('/api/v1/web/menu/list >> ', error);

    return res.status(400).json({
      error: error,
      message: '데이터를 불러오지 못했습니다.',
    });
  }
});

/** 메뉴 추가 */
MenuRouter.post('/add', auth, multer, async (req: Request, res: Response) => {
  const currentUser = req.currentUser;
  const data = req.body;

  let imageUrl = '';
  try {
    if (req.file) imageUrl = (req.file as Express.MulterS3.File).location;

    await client.query(
      `INSERT INTO product (name, price, description, image_url, company_id, creator_id)
      VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        data.name,
        +data.price,
        data.description,
        imageUrl,
        currentUser?.company_id,
        currentUser?.id,
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
});

/** 메뉴 수정 */
MenuRouter.post('/edit', auth, multer, async (req: Request, res: Response) => {
  const currentUser = req.currentUser;
  const data = req.body;
  try {
    if (req.file) {
      const imageUrl = (req.file as Express.MulterS3.File).location;

      const prvImageUrlResult = await client.query(
        `SELECT image_url FROM product WHERE id=${data.id}`
      );
      const prvImageUrl = prvImageUrlResult.rows[0].image_url;

      if (prvImageUrl !== '') {
        const path = prvImageUrl.substring(
          prvImageUrl.indexOf(`${currentUser?.company_id}/menu`)
        );
        await imageDeleteCommand(path);
      }

      await client.query(
        `UPDATE product
        SET name='${data.name}', price=${+data.price}, description='${
          data.description
        }',image_url='${imageUrl}',updated_at=now()
        WHERE id=${data.id}`
      );

      return res.status(200).json({
        message: '메뉴가 수정되었습니다.',
      });
    }

    await client.query(
      `UPDATE product
      SET name='${data.name}', price=${+data.price}, description='${
        data.description
      }',updated_at=now()
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
});

/** 메뉴 삭제 */
MenuRouter.post('/delete', auth, async (req: Request, res: Response) => {
  const currentUser = req.currentUser;
  const { id }: { id: number } = req.body;
  try {
    const imageUrlResult = await client.query(
      `SELECT image_url FROM product WHERE id=${id}`
    );
    const imageUrl = imageUrlResult.rows[0].image_url;

    if (imageUrl !== '') {
      const path = imageUrl.substring(
        imageUrl.indexOf(`${currentUser?.company_id}/menu`)
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
});

//데이터타입 체크 ..
