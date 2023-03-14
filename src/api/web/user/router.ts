import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  signInCheck,
  signUpCheck,
  validate,
} from '../../../middleware/validator';
import {
  IMemberSignUpData,
  ISignIn,
  ISignUpData,
  IUserSignUp,
} from '../../../types/api';
import { client } from '../../../db/db';
import bcrypt from 'bcrypt';
import { IUser } from '../../../types/data';
import { auth } from '../../../middleware/auth';

export const UserRouter = express.Router();

// 트랜잭션 적용 해야합니다!! ...

/** 회사 OWNER 회원가입  */
UserRouter.post(
  '/signup',
  ...validate(signUpCheck),
  async (req: Request, res: Response) => {
    const data: ISignUpData = req.body;
    const { companyName, companyNumber, ...userInfo } = data;
    const salt = Number(process.env.HASH_SALT);

    try {
      /** company 생성 */
      await client.query(
        `INSERT INTO company (name, company_number)
           VALUES ($1,$2)`,
        [companyName, companyNumber]
      );

      const result = await client.query(
        `SELECT id FROM company WHERE company_number='${companyNumber}'`
      );
      const companyId = result.rows[0];

      /** OWNER user 생성 */
      const hashPassword = await bcrypt.hash(data.password, salt);
      const userData: IUserSignUp = {
        ...userInfo,
        password: hashPassword,
        companyId,
      };

      await client.query(
        `INSERT INTO "user" (email, password, name, phone, auth,company_id) 
        VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          userData.email,
          userData.password,
          userData.name,
          userData.phone,
          userData.auth,
          userData.companyId,
        ]
      );

      return res.status(200).json({
        message: '회원가입에 성공했습니다. 로그인 페이지로 이동합니다.',
      });
    } catch (error: any) {
      console.error('/api/v1/web/user/signup >> ', error);

      if (error.code === '23505') {
        const errorType = error.constraint;
        switch (errorType) {
          case 'Company_name_key':
            return res.status(409).json({
              error: error,
              message: '이미 가입된 회사명입니다.',
            });
          case 'Company_company_number_key':
            return res.status(409).json({
              error: error,
              message: '이미 가입된 사업자 등록번호입니다.',
            });
          case 'User_email_key':
            return res.status(409).json({
              error: error,
              message: '이미 사용중인 이메일입니다.',
            });
          case 'User_phone_key':
            return res.status(409).json({
              error: error,
              message: '이미 사용중인 전화번호입니다.',
            });

          default:
            return res.status(409).json({
              error: error,
              message: '알 수 없는 에러입니다. 잠시후에 다시 시도해주세요!',
            });
        }
      }

      return res.status(400).json({
        error: error,
        message: '회원가입에 실패했습니다. 새로고침후에 시도해주세요.',
      });
    }
  }
);

/** 회사 Member 회원가입  */
UserRouter.post(
  '/member/signup',
  ...validate(signUpCheck),
  auth,
  async (req: Request, res: Response) => {
    const data: IMemberSignUpData = req.body;
    const salt = Number(process.env.HASH_SALT);

    try {
      /** member 생성 */
      const hashPassword = await bcrypt.hash(data.password, salt);
      const userData: IUserSignUp = {
        ...data,
        password: hashPassword,
        companyId: req.currentUser?.company_id,
      };

      await client.query(
        `INSERT INTO "user" (email, password, name, phone, auth,company_id) 
          VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          userData.email,
          userData.password,
          userData.name,
          userData.phone,
          userData.auth,
          userData.companyId,
        ]
      );

      return res.status(200).json({
        message: '회원이 추가되었습니다.',
      });
    } catch (error: any) {
      console.error('/api/v1/web/user/signup >> ', error);

      if (error.code === '23505') {
        const errorType = error.constraint;
        switch (errorType) {
          case 'User_email_key':
            return res.status(409).json({
              error: error,
              message: '이미 사용중인 이메일입니다.',
            });
          case 'User_phone_key':
            return res.status(409).json({
              error: error,
              message: '이미 사용중인 전화번호입니다.',
            });

          default:
            return res.status(409).json({
              error: error,
              message: '알 수 없는 에러입니다. 잠시후에 다시 시도해주세요!',
            });
        }
      }

      return res.status(400).json({
        error: error,
        message: '회원가입에 실패했습니다. 새로고침후에 시도해주세요.',
      });
    }
  }
);

UserRouter.post(
  '/signin',
  ...validate(signInCheck),
  async (req: Request, res: Response) => {
    const { email, password }: ISignIn = req.body;

    try {
      client.query(
        `SELECT * FROM "user" WHERE email = '${email}'`,
        async (err, result) => {
          if (err) throw err;

          if (result.rows.length === 0) {
            res.status(401).json({ message: '존재하지 않는 이메일입니다.' });
          }
          const user: IUser = result.rows[0];
          if (user.status === 0) {
            res.status(401).json({
              message: '회원탈퇴한 계정입니다. 고객센터에 문의해주세요.',
            });
          }
          if (user.status === 2) {
            res.status(401).json({
              message: '정지되어있는 계정입니다. 고객센터에 문의해주세요.',
            });
          }
          const isCompare = await bcrypt.compare(password, user.password);

          if (!isCompare) {
            res.status(401).json({
              message: '비밀번호가 일치하지 않습니다.',
            });
          }
          //access Token 발급
          const accessToken = jwt.sign(
            { id: user.id },
            String(process.env.ACCESS_SECRET),
            { expiresIn: '30m', issuer: 'hwan_0_hae' }
          );

          //refresh Token 발급
          const refreshToken = jwt.sign(
            { id: user.id },
            String(process.env.REFRESH_SECRET),
            { expiresIn: '24h', issuer: 'hwan_0_hae' }
          );

          //token 전송
          res.cookie('access_token', accessToken, {
            secure: false,
            httpOnly: true,
          });

          res.cookie('refresh_token', refreshToken, {
            secure: false,
            httpOnly: true,
          });

          client.query(
            `UPDATE "user" SET token='${refreshToken}', updated_at=now() WHERE id=${user.id}`
          );

          res.status(200).json({ message: '로그인에 성공했습니다.' });
        }
      );
    } catch (error: any) {
      console.error('/api/v1/web/user/signin >> ', error);

      return res.status(400).json({
        error: error,
        message: '로그인에 실패했습니다. 새로고침후에 시도해주세요!',
      });
    }
  }
);
