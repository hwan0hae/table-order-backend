import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../../../types/data';
import client from '../../../db/db';
import validate, {
  appAuthCheck,
  appSignInCheck,
} from '../../../middleware/validator';
import { IAppSignInData, IAppUserAuthData } from '../../../types/api';

const UserRouter = express.Router();

UserRouter.post(
  '/signin',
  ...validate(appSignInCheck),
  async (req: Request, res: Response) => {
    const { email, password, tableNo }: IAppSignInData = req.body;

    try {
      const result = await client.query(
        `SELECT * FROM "user" WHERE email = '${email}'`
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: '존재하지 않는 이메일입니다.' });
      }
      const user: IUser = result.rows[0];

      if (user.status === 0) {
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

      if (user.status === 2) {
        return res.status(401).json({
          message: '정지되어있는 계정입니다. 고객센터에 문의해주세요.',
        });
      }

      if (user.auth !== 'USER') {
        return res.status(401).json({
          message: 'USER 계정이 아닙니다. 다시 확인해주세요.',
        });
      }

      // access Token 발급
      const accessToken = jwt.sign(
        { id: user.id },
        String(process.env.JWT_ACCESS_SECRET),
        { expiresIn: '30m', issuer: 'hwan_0_hae' }
      );

      // refresh Token 발급
      const refreshToken = jwt.sign(
        { id: user.id },
        String(process.env.JWT_REFRESH_SECRET),
        { expiresIn: '24h', issuer: 'hwan_0_hae' }
      );

      client.query(
        `UPDATE "user" SET token='${refreshToken}', updated_at=now() WHERE id=${user.id}`
      );

      return res.status(200).json({
        data: { accessToken, refreshToken, tableNo },
        message: '로그인 되었습니다.',
      });
    } catch (error) {
      console.error('/api/v1/app/user/signin >> ', error);

      return res.status(400).json({
        error,
        message: '로그인에 실패했습니다. 앱을 재실행 후 시도해주세요!',
      });
    }
  }
);

UserRouter.post(
  '/auth',
  ...validate(appAuthCheck),
  async (req: Request, res: Response) => {
    const { accessToken, refreshToken, tableNo }: IAppUserAuthData = req.body;
    // 검증 갱신 만료됐으면 만료됐다 응답하고 앱에서 데이터삭제 + signin으로 리다이랙트
    try {
      const decoded = jwt.verify(
        accessToken,
        String(process.env.JWT_ACCESS_SECRET)
      ) as JwtPayload;

      return res.status(200).json({
        message: '로그인 되었습니다.',
      });
    } catch (error: any) {
      console.error('/api/v1/app/user/auth >> ', error);

      if (error.name === 'TokenExpiredError') {
        const result = await client.query(
          `SELECT id FROM "user" WHERE token='${refreshToken}' `
        );

        if (result.rows.length === 0) {
          return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
        }
        const user: { id: number } = result.rows[0];

        // access Token 재발급
        const newAccessToken = jwt.sign(
          { id: user.id },
          String(process.env.JWT_ACCESS_SECRET),
          { expiresIn: '30m', issuer: 'hwan_0_hae' }
        );

        // refresh Token 재발급
        const newRefreshToken = jwt.sign(
          { id: user.id },
          String(process.env.JWT_REFRESH_SECRET),
          { expiresIn: '24h', issuer: 'hwan_0_hae' }
        );

        await client.query(
          `UPDATE "user" SET token='${newRefreshToken}', updated_at=now() WHERE id=${user.id}`
        );

        return res.status(200).json({
          data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            tableNo,
          },
          message: '로그인 되었습니다.',
        });
      }

      return res.status(400).json({
        error,
        message: '로그인에 실패했습니다. 앱을 재실행 후 시도해주세요!',
      });
    }
  }
);

export default UserRouter;
