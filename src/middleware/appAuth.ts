import { ITable } from '@src/types/data';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import client from '../db/db';

const appAuthChecker = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token = req.header('Authorization');
  if (token) {
    token = token.replace(/^Bearer\s+/, '');
    try {
      const decode = jwt.verify(
        token,
        String(process.env.JWT_ACCESS_SECRET)
      ) as JwtPayload;
      const result = await client.query(
        `SELECT * FROM table_management WHERE table_id=${decode.tableId}`
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: '존재하지 않는 테이블입니다.' });
      }

      const currentTable: ITable = result.rows[0];

      req.appCurrentTable = { ...currentTable };
    } catch (error: any) {
      console.error('appAuth >> ', error);

      return res.status(401).json(error);
    }
  } else {
    return res.status(401).json({ message: '토큰이 존재하지 않습니다.' });
  }
  return next();
};

export default appAuthChecker;
