import express, { Request, Response } from 'express';
import {
  IGetOrderDetailRequest,
  IGetOrderRequest,
  IOrderData,
} from '../../../types/api';
import { socketIo } from '../../../socket/socket';
import appAuthChecker from '../../../middleware/appAuth';
import client from '../../../db/db';

const OrderRouter = express.Router();

OrderRouter.post(
  '/request',
  appAuthChecker,
  async (req: Request, res: Response) => {
    const table = req.appCurrentTable;
    const data: IOrderData[] = req.body;
    try {
      await client.query(
        `UPDATE table_management SET status='3', updated_at=now() WHERE table_id=${table.table_id}`
      );

      const result = await client.query(
        `INSERT INTO "order" (company_id, table_id)
            VALUES ($1,$2) RETURNING order_id, created_at`,
        [table.company_id, table.table_id]
      );
      await Promise.all(
        data.map(async (order) => {
          await client.query(
            `INSERT INTO order_detail (order_id, product_id, count)
                  VALUES ($1,$2,$3) `,
            [result.rows[0].order_id, order.productId, order.count]
          );
        })
      );

      const detailResult = await client.query(
        `SELECT od.order_id as "orderId", od.detail_id as "detailId", p.name as "productName", p.price as "productPrice", od.count as "productCount", od.created_at as "createdAt"
            FROM order_detail as "od"
            LEFT JOIN product as "p"
            ON od.product_id = p.id
            WHERE od.order_id = ${result.rows[0].order_id}
            ORDER BY od.created_at ASC
            `
      );

      const orderDetail: IGetOrderDetailRequest[] = detailResult.rows;

      const orderData: IGetOrderRequest = {
        orderId: result.rows[0].order_id,
        tableNo: table.table_no,
        createdAt: result.rows[0].created_at,
      };

      const socketData = { ...orderData, orderDetail };
      socketIo[0].to(String(table.company_id)).emit('orderData', socketData);

      return res.status(200).json({ message: '주문이 완료 되었습니다.' });
    } catch (error) {
      console.error('/api/v1/app/order/request >> ', error);

      return res.status(400).json({ error, message: '뭔가 에러가 떳씁니당.' });
    }
  }
);

export default OrderRouter;
