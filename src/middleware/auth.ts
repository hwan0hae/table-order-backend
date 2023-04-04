import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import client from '../db/db';
import { IUser } from '../types/data';

const authChecker = async (req: Request, res: Response, next: NextFunction) => {
  const token: string = req.cookies.access_token;
  const refreshToken: string = req.cookies.refresh_token;
  if (!token)
    return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });

  try {
    // 토큰을 디코딩 합니다
    const decoded = jwt.verify(
      token,
      String(process.env.JWT_ACCESS_SECRET)
    ) as JwtPayload;
    const result = await client.query(
      `SELECT * FROM "user" WHERE id=${decoded.id} `
    );

    if (result.rows.length === 0) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return res.status(401).json({ message: '데이터가 조회되지 않습니다.' });
    }

    const user: IUser = result.rows[0];

    const remainingTime = decoded.exp;

    if (remainingTime) {
      // 토큰 만료일이 10분밖에 안남으면 토큰을 재발급합니다
      if (Date.now() / 1000 - remainingTime < 60 * 10) {
        // DB 토큰과 일치한다면 유효한지 확인 후 토큰 재발급
        if (user.token === refreshToken) {
          jwt.verify(
            refreshToken,
            String(process.env.JWT_REFRESH_SECRET),
            (err, decode) => {
              if (err) {
                res.clearCookie('access_token');
                res.clearCookie('refresh_token');
                return res
                  .status(401)
                  .json({ message: '토큰이 유효하지 않습니다.' });
              }
              // access token 재발급
              const accessToken = jwt.sign(
                { id: user.id },
                String(process.env.JWT_ACCESS_SECRET),
                { expiresIn: '30m', issuer: 'Hwan_0_hae' }
              );

              return res.cookie('access_token', accessToken, {
                secure: false,
                httpOnly: true,
              });
            }
          );
        } else {
          res.clearCookie('access_token');
          res.clearCookie('refresh_token');
          return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
        }
      }
    }
    // userData 전달
    req.currentUser = user;
  } catch (error: any) {
    // 엑세스 토큰 만료시 리프레시 토큰 확인 후 재발급
    console.log('jwtAuth >>> ', error);

    if (error.name === 'TokenExpiredError') {
      const result = await client.query(
        `SELECT * FROM "user" WHERE token='${refreshToken}' `
      );

      if (result.rows.length === 0) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
      }

      const user: IUser = result.rows[0];

      jwt.verify(
        refreshToken,
        String(process.env.JWT_REFRESH_SECRET),
        async (err, decode) => {
          if (err) {
            res.clearCookie('access_token');
            res.clearCookie('refresh_token');
            return res
              .status(401)
              .json({ message: '토큰이 유효하지 않습니다.' });
          }
          // access token 재발급
          const newAccessToken = jwt.sign(
            { id: user.id },
            String(process.env.JWT_ACCESS_SECRET),
            { expiresIn: '30m', issuer: 'Hwan_0_hae' }
          );

          // refresh Token 재발급
          const newRefreshToken = jwt.sign(
            { id: user.id, auth: user.auth },
            String(process.env.JWT_REFRESH_SECRET),
            { expiresIn: '24h', issuer: 'hwan_0_hae' }
          );
          await client.query(
            `UPDATE "user" SET token='${newRefreshToken}', updated_at=now() WHERE id=${user.id}`
          );

          res.cookie('access_token', newAccessToken, {
            secure: false,
            httpOnly: true,
          });

          return res.cookie('refresh_token', newRefreshToken, {
            secure: false,
            httpOnly: true,
          });
        }
      );
      // userData 전달
      req.currentUser = user;
    } else {
      return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
    }
  }
  return next();
};

export default authChecker;
