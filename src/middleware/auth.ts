import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { client } from '../db/db';
import { IRefreshTokenCompare } from '../types/data';

//data 넘기기 확인
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const token: string = req.cookies.access_token;
  const refreshToken: string = req.cookies.refresh_token;
  if (!token) return next();

  try {
    // 토큰을 디코딩 합니다
    const decoded = jwt.verify(
      token,
      String(process.env.ACCESS_SECRET)
    ) as JwtPayload;
    const remainingTime = decoded.iat;

    if (remainingTime) {
      // 토큰 만료일이 10분밖에 안남으면 토큰을 재발급합니다
      if (Date.now() / 1000 - remainingTime > 60 * 10) {
        const result = await client.query(
          `SELECT token,id FROM "user" WHERE id=${decoded.id} `
        );

        if (result.rows.length === 0) {
          res.clearCookie('access_token');
          res.clearCookie('refresh_token');
        }

        const user: IRefreshTokenCompare = result.rows[0];

        //DB 토큰과 일치한다면 유효한지 확인 후 토큰 재발급
        if (user.token === req.cookies.refresh_token) {
          jwt.verify(
            refreshToken,
            String(process.env.REFRESH_SECRET),
            (err, decode) => {
              if (err) {
                res.clearCookie('access_token');
                res.clearCookie('refresh_token');
              }
              //access token 재발급
              const accessToken = jwt.sign(
                { id: user.id },
                String(process.env.ACCESS_SECRET),
                { expiresIn: '30m', issuer: 'Hwan_0_hae' }
              );

              res.cookie('access_token', accessToken, {
                secure: false,
                httpOnly: true,
              });
            }
          );
        } else {
          res.clearCookie('access_token');
          res.clearCookie('refresh_token');
        }
      }
    }

    req.currentUserId = decoded.id;
  } catch (error: any) {
    //엑세스 토큰 만료시 리프레시 토큰 확인 후 재발급
    console.log('jwtAuth >>> ', error);

    if (error.name === 'TokenExpiredError') {
      const result = await client.query(
        `SELECT token,id FROM "user" WHERE token='${refreshToken}' `
      );

      if (result.rows.length === 0) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
      }

      const user: IRefreshTokenCompare = result.rows[0];

      jwt.verify(
        refreshToken,
        String(process.env.REFRESH_SECRET),
        (err, decode) => {
          if (err) {
            res.clearCookie('access_token');
            res.clearCookie('refresh_token');
          }
          //access token 재발급
          const accessToken = jwt.sign(
            { id: user.id },
            String(process.env.ACCESS_SECRET),
            { expiresIn: '30m', issuer: 'Hwan_0_hae' }
          );

          res.cookie('access_token', accessToken, {
            secure: false,
            httpOnly: true,
          });
        }
      );
    }

    req.currentUserId = null;
  }

  return next();
};
