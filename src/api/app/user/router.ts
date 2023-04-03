import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../../../types/data';
import client from '../../../db/db';
import validate, { appSignInCheck } from '../../../middleware/validator';
import { IAppSignInData } from '../../../types/api';
import appAuthChecker from '../../../middleware/appAuth';

const UserRouter = express.Router();

UserRouter.post(
  '/signin',
  ...validate(appSignInCheck),
  async (req: Request, res: Response) => {
    const { email, password, tableNo }: IAppSignInData = req.body;

    try {
      await client.query('BEGIN');

      const result = await client.query(
        `SELECT * FROM "user" WHERE email = '${email}'`
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: '존재하지 않는 이메일입니다.' });
      }
      const user: IUser = result.rows[0];

      if (user.status === '0') {
        return res.status(401).json({
          message: '회원탈퇴한 계정입니다. 고객센터에 문의해주세요.',
        });
      }

      const isCompare = await bcrypt.compare(password, user.password);

      if (!isCompare) {
        return res.status(401).json({
          message: '비밀번호가 일치하지 않습니다.',
        });
      }

      if (user.status === '2') {
        return res.status(401).json({
          message: '정지되어있는 계정입니다. 고객센터에 문의해주세요.',
        });
      }

      if (user.auth !== 'USER') {
        return res.status(401).json({
          message: 'USER 계정이 아닙니다. 다시 확인해주세요.',
        });
      }
      const tableResult = await client.query(
        `SELECT * FROM table_management WHERE table_no = ${tableNo}`
      );

      if (tableResult.rows.length === 0) {
        return res
          .status(401)
          .json({ message: '존재하지 않는 테이블 번호입니다.' });
      }
      const table: { table_id: number } = tableResult.rows[0];
      console.log(tableResult.rows);
      // access Token 발급
      const accessToken = jwt.sign(
        { id: user.id, tableId: table.table_id },
        String(process.env.JWT_ACCESS_SECRET),
        { expiresIn: '30m', issuer: 'hwan_0_hae' }
      );

      // refresh Token 발급
      const refreshToken = jwt.sign(
        { id: user.id, tableId: table.table_id },
        String(process.env.JWT_REFRESH_SECRET),
        { expiresIn: '24h', issuer: 'hwan_0_hae' }
      );

      await client.query(
        `UPDATE "user" SET token='${refreshToken}', updated_at=now() WHERE id=${user.id}`
      );
      await client.query(
        `UPDATE table_management SET status='2', updated_at=now() WHERE table_id=${table.table_id}`
      );
      await client.query('COMMIT');

      return res.status(200).json({
        data: { accessToken, refreshToken, tableNo },
        message: '로그인 되었습니다.',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('/api/v1/app/user/signin >> ', error);

      return res.status(400).json({
        error,
        message: '로그인에 실패했습니다. 앱을 재실행 후 시도해주세요!',
      });
    }
  }
);

UserRouter.get('/refreshtoken', async (req: Request, res: Response) => {
  let token = req.header('Authorization');
  if (token) {
    token = token.replace(/^Bearer\s+/, '');
    try {
      const result = await client.query(
        `SELECT id FROM "user" WHERE token='${token}' `
      );
      if (result.rows.length === 0) {
        return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
      }

      const decode = jwt.verify(
        token,
        String(process.env.JWT_REFRESH_SECRET)
      ) as JwtPayload;

      // access Token 재발급
      const newAccessToken = jwt.sign(
        { id: decode.id, tableId: decode.tableId },
        String(process.env.JWT_ACCESS_SECRET),
        { expiresIn: '30m', issuer: 'hwan_0_hae' }
      );

      // refresh Token 재발급
      const newRefreshToken = jwt.sign(
        { id: decode.id, tableId: decode.tableId },
        String(process.env.JWT_REFRESH_SECRET),
        { expiresIn: '24h', issuer: 'hwan_0_hae' }
      );

      await client.query(
        `UPDATE "user" SET token='${newRefreshToken}', updated_at=now() WHERE id=${decode.id}`
      );

      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error: any) {
      console.error('/api/v1/app/user/refreshtoken  >> ', error);

      return res.status(401).json(error);
    }
  } else {
    return res
      .status(401)
      .json({ message: '리프레시 토큰이 존재하지 않습니다.' });
  }
});

UserRouter.post(
  '/play',
  appAuthChecker,
  async (req: Request, res: Response) => {
    try {
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('/api/v1/app/user/play  >> ', error);

      return res.status(401).json(error);
    }
  }
);

export default UserRouter;
