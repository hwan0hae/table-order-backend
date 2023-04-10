import express, { Request, Response } from 'express';
import authChecker from '../../../middleware/auth';
import client from '../../../db/db';
import validate, { tableAddCheck } from '../../../middleware/validator';
import {
  IGetOrderDetailRequest,
  IGetTableDetailReference,
  ITableAddData,
} from '../../../types/api';

const ManagementRouter = express.Router();

ManagementRouter.get(
  '/table',
  authChecker,
  async (req: Request, res: Response) => {
    const user = req.currentUser;

    try {
      const result = await client.query(`
        SELECT table_id as "tableId", table_no as "tableNo", loc_x as "locX", loc_y as "locY", status, table_width as "tableWidth", table_height as "tableHeight"
        FROM table_management 
        WHERE company_id=${user?.company_id}`);

      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('/api/v1/web/management/table >> ', error);

      return res.status(400).json({ error, message: '뭔가 에러가 떳씁니당.' });
    }
  }
);

ManagementRouter.get(
  '/tabledetail',
  authChecker,
  async (req: Request, res: Response) => {
    const user = req.currentUser;
    const { id } = req.query;
    try {
      const orderResult = await client.query(`
        SELECT order_id as "orderId", modified_at as "modifiedAt"
        FROM  "order" 
        WHERE company_id=${user?.company_id} AND table_id=${id} AND order_status=2`);

      const tableDetailData = await Promise.all(
        orderResult.rows.map(async (order: IGetTableDetailReference) => {
          const detailResult = await client.query(
            `SELECT od.order_id as "orderId", od.detail_id as "detailId", p.name as "productName", p.price as "productPrice", od.count as "productCount", od.created_at as "createdAt"
              FROM order_detail as "od"
              LEFT JOIN product as "p"
              ON od.product_id = p.id
              WHERE od.order_id = ${order.orderId}
              ORDER BY od.created_at ASC
              `
          );

          const orderDetail: IGetOrderDetailRequest[] = detailResult.rows;

          return { ...order, orderDetail };
        })
      );

      return res.status(200).json(tableDetailData);
    } catch (error) {
      console.error('/api/v1/web/management/tabledetail >> ', error);

      return res.status(400).json({ error, message: '뭔가 에러가 떳씁니당.' });
    }
  }
);
ManagementRouter.post(
  '/payment',
  authChecker,
  async (req: Request, res: Response) => {
    const user = req.currentUser;
    const { tableId }: { tableId: number } = req.body;
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE "order" 
        SET order_status=3, modified_at=now() 
        WHERE table_id=${tableId} AND company_id=${user?.company_id}`
      );
      await client.query(
        `UPDATE table_management 
        SET status='2', updated_at=now() 
        WHERE table_id=${tableId} AND company_id=${user?.company_id}`
      );
      await client.query('COMMIT');

      return res.status(200).json({ message: '결제 되었습니다.' });
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('/api/v1/web/management/payment >> ', error);

      return res
        .status(400)
        .json({ error, message: '결제중 에러가 발생했습니다.' });
    }
  }
);

ManagementRouter.post(
  '/add',
  ...validate(tableAddCheck),
  authChecker,
  async (req: Request, res: Response) => {
    const user = req.currentUser;
    const {
      tableNo,
      name,
      locX,
      locY,
      tableWidth,
      tableHeight,
    }: ITableAddData = req.body;

    try {
      await client.query(
        `INSERT INTO table_management (table_no, name, loc_x, loc_y, table_width, table_height, company_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7) `,
        [tableNo, name, locX, locY, tableWidth, tableHeight, user?.company_id]
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
