import express, { Request, Response } from 'express';
import client from '../../../db/db';
import authChecker from '../../../middleware/auth';

const SalesRouter = express.Router();

SalesRouter.get('/', authChecker, async (req: Request, res: Response) => {
  const user = req.currentUser;
  const { year, month } = req.query;
  const nextMonth = Number(month) + 1;
  try {
    const result = await client.query(`
    SELECT to_char(o.modified_at,'DD') AS "day", SUM(p.price * od.count ) AS "salesAmount"
    FROM order_detail AS "od"
    LEFT JOIN "order" AS "o"
    ON od.order_id = o.order_id
    LEFT JOIN product AS "p"
    ON od.product_id = p.id
    WHERE o.order_status=3 AND o.company_id=${user?.company_id} AND o.modified_at BETWEEN '${year}-${month}-1' AND '${year}-${nextMonth}-1'
    GROUP BY day
    ORDER BY day ASC
    `);
    let monthlySales = 0;
    if (result.rows.length !== 0) {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < result.rows.length; i++) {
        monthlySales += Number(result.rows[i].salesAmount);
      }
    }
    return res.status(200).json({ monthlySales, dailySales: result.rows });
  } catch (error: any) {
    console.error('/api/v1/web/sales >> ', error);

    return res.status(400).json({
      error,
      message: '매출현황을 불러올 수 없습니다.',
    });
  }
});

export default SalesRouter;
