import express, { Request, Response } from 'express';
import { IGetOrderDetailRequest, IGetOrderRequest } from '../../../types/api';
import client from '../../../db/db';
import authChecker from '../../../middleware/auth';

const OrderRouter = express.Router();

OrderRouter.get(
  '/request',
  authChecker,
  async (req: Request, res: Response) => {
    const user = req.currentUser;
    try {
      const orderResult = await client.query(
        `SELECT o.order_id as "orderId", t.table_no as "tableNo" , o.created_at as "createdAt"
        FROM "order" as "o"
        LEFT JOIN table_management as "t"
        ON o.table_id = t.table_id        
        WHERE o.company_id = '${user?.company_id}' AND o.order_status = 1 
        ORDER BY o.created_at ASC
        `
      );
      const detailResult = await client.query(
        `SELECT od.order_id as "orderId", od.detail_id as "detailId", p.name as "productName", p.price as "productPrice", od.count as "productCount", od.created_at as "createdAt"
        FROM order_detail as "od"
        LEFT JOIN product as "p"
        ON od.product_id = p.id
        ORDER BY od.created_at ASC
        `
      );
      if (orderResult.rows.length === 0) {
        return res.status(200).json();
      }

      const data = orderResult.rows.map((order: IGetOrderRequest) => {
        const object: IGetOrderDetailRequest[] = detailResult.rows.filter(
          (detail: IGetOrderDetailRequest) => {
            return detail.orderId === order.orderId;
          }
        );
        return { ...order, orderDetail: object };
      });

      return res.status(200).json(data);
    } catch (error) {
      console.error('/api/v1/web/order/request >> ', error);

      return res.status(400).json({ error, message: '뭔가 에러가 떳씁니당.' });
    }
  }
);

export default OrderRouter;
