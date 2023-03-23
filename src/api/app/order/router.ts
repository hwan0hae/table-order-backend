import express, { Request, Response } from 'express';
import { IOrderData } from '../../../types/api';
import { socketArr } from '../../../socket/socket';

const OrderRouter = express.Router();

OrderRouter.post('/request', async (req: Request, res: Response) => {
  const data: IOrderData = req.body;

  try {
    socketArr.map((socket, index) => {
      return socket.emit('orderData', data);
    });
    return res.status(200).json({ message: '주문이 완료 되었습니다.' });
  } catch (error) {
    console.error('/api/v1/app/order/request >> ', error);

    return res.status(400).json({ error, message: '뭔가 에러가 떳씁니당.' });
  }
});

export default OrderRouter;
