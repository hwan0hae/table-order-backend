import express, { Request, Response } from 'express';
import authChecker from '../../../middleware/auth';
import client from '../../../db/db';
import validate, { tableAddCheck } from '../../../middleware/validator';
import { ITableAddData } from '../../../types/api';

const ManagementRouter = express.Router();

ManagementRouter.post(
  '/add',
  ...validate(tableAddCheck),
  authChecker,
  async (req: Request, res: Response) => {
    const user = req.currentUser;
    const { tableNo, name, locX, locY }: ITableAddData = req.body;
    console.log(locX);
    console.log(typeof locX);
    try {
      await client.query(
        `INSERT INTO management (table_no, name, loc_x, loc_y, company_id)
      VALUES ($1,$2,$3,$4,$5) `,
        [tableNo, name, locX, locY, user?.company_id]
      );
      return res.status(200).json({ message: '테이블이 추가 되었습니다.' });
    } catch (error: any) {
      console.error('/api/v1/web/management/add >> ', error);

      if (error.code === '23505') {
        const errorType = error.constraint;
        switch (errorType) {
          case 'table_no_unique':
            return res.status(409).json({
              error,
              message: '이미 존재하는 테이블 번호입니다.',
            });

          default:
            return res
              .status(400)
              .json({ error, message: '테이블을 추가하지 못했습니다.' });
        }
      }
      return res
        .status(400)
        .json({ error, message: '테이블을 추가하지 못했습니다.' });
    }
  }
);

export default ManagementRouter;
