import express, { Request, Response } from 'express';
import { IOrderData } from '../../../types/api';
import { socketArr } from '../../../socket/socket';
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
        `UPDATE table_management SET status='3', updated_at=now() WHERE id=${table.id}`
      );

      client.query(
        `INSERT INTO "order" (company_id, table_id)
            VALUES ($1,$2) RETURNING order_id`,
        [table.company_id, table.id],
        (err, result) => {
          if (err) throw err;

          data.map(async (order) => {
            await client.query(
              `INSERT INTO "order_detail" (order_id, product_id, count)
                  VALUES ($1,$2,$3)`,
              [result.rows[0].order_id, order.productId, order.count]
            );
          });
        }
      );

      socketArr.map((socket, index) => {
        return socket.emit('orderData', data);
      });
      return res.status(200).json({ message: '주문이 완료 되었습니다.' });
    } catch (error) {
      console.error('/api/v1/app/order/request >> ', error);

      return res.status(400).json({ error, message: '뭔가 에러가 떳씁니당.' });
    }
  }
);

export default OrderRouter;
