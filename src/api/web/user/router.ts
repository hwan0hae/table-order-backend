import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  signInCheck,
  signUpCheck,
  validate,
} from '../../../middleware/validator';
import { IEditUserData, ISignInData, ISignUpData } from '../../../types/api';
import client from '../../../db/db';
import { IUser, IUserSignUp } from '../../../types/data';

import authChecker from '../../../middleware/auth';

const UserRouter = express.Router();

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
      const companyId = result.rows[0].id;

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
              error,
              message: '이미 가입된 회사명입니다.',
            });
          case 'Company_company_number_key':
            return res.status(409).json({
              error,
              message: '이미 가입된 사업자 등록번호입니다.',
            });
          case 'User_email_key':
            return res.status(409).json({
              error,
              message: '이미 사용중인 이메일입니다.',
            });
          case 'User_phone_key':
            return res.status(409).json({
              error,
              message: '이미 사용중인 전화번호입니다.',
            });

          default:
            return res.status(409).json({
              error,
              message: '알 수 없는 에러입니다. 잠시후에 다시 시도해주세요!',
            });
        }
      }

      return res.status(400).json({
        error,
        message: '회원가입에 실패했습니다. 새로고침후에 시도해주세요.',
      });
    }
  }
);

/** 로그인  */
UserRouter.post(
  '/signin',
  ...validate(signInCheck),
  async (req: Request, res: Response) => {
    const { email, password }: ISignInData = req.body;

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
      if (user.status === 2) {
        return res.status(401).json({
          message: '정지되어있는 계정입니다. 고객센터에 문의해주세요.',
        });
      }
      const isCompare = await bcrypt.compare(password, user.password);

      if (!isCompare) {
        return res.status(401).json({
          message: '비밀번호가 일치하지 않습니다.',
        });
      }
      // access Token 발급
      const accessToken = jwt.sign(
        { id: user.id, auth: user.auth },
        String(process.env.JWT_ACCESS_SECRET),
        { expiresIn: '30m', issuer: 'hwan_0_hae' }
      );

      // refresh Token 발급
      const refreshToken = jwt.sign(
        { id: user.id, auth: user.auth },
        String(process.env.JWT_REFRESH_SECRET),
        { expiresIn: '24h', issuer: 'hwan_0_hae' }
      );

      // token 전송
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

      const companyResult = await client.query(
        `SELECT name FROM company WHERE id=${user.company_id}`
      );
      const companyName: string = companyResult.rows[0].name;

      const userInfo = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        auth: user.auth,
        companyId: user.company_id,
        companyName,
      };

      return res
        .status(200)
        .json({ data: userInfo, message: '로그인에 성공했습니다.' });
    } catch (error: any) {
      console.error('/api/v1/web/user/signin >> ', error);

      return res.status(400).json({
        error,
        message: '로그인에 실패했습니다. 새로고침후에 시도해주세요!',
      });
    }
  }
);

UserRouter.post('/logout', async (req: Request, res: Response) => {
  try {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.status(200).json({
      message: '로그아웃 되었습니다.',
    });
  } catch (error: any) {
    console.error('/api/v1/web/user/logout >> ', error);

    return res.status(400).json({
      error,
      message: '로그아웃에 실패했습니다. 새로고침후에 시도해주세요!',
    });
  }
});

/** 로그아웃 */
UserRouter.post('/logout', async (req: Request, res: Response) => {
  try {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.status(200).json({
      message: '로그아웃 되었습니다.',
    });
  } catch (error: any) {
    console.error('/api/v1/web/user/logout >> ', error);

    return res.status(400).json({
      error,
      message: '로그아웃에 실패했습니다. 새로고침후에 시도해주세요!',
    });
  }
});

/** 유저 삭제 */
// currentUser 권한 확인해서 owner인지 자기자신인지도 나중에 추가할 것
UserRouter.post('/delete', authChecker, async (req: Request, res: Response) => {
  const { id }: { id: number } = req.body;
  try {
    client.query(
      `UPDATE "user" SET status='0' , updated_at=now() WHERE id=${id}`
    );

    return res.status(200).json({
      message: '회원이 삭제되었습니다.',
    });
  } catch (error: any) {
    console.error('/api/v1/web/user/delete >> ', error);

    return res.status(400).json({
      message: '회원 삭제에 실패하였습니다.',
    });
  }
});

/** 유저 수정 */
// currentUser 권한 확인해서 owner인지 자기자신인지도 나중에 추가할 것
UserRouter.post('/edit', authChecker, async (req: Request, res: Response) => {
  const { id, email, name, phone, auth, status }: IEditUserData = req.body;

  try {
    client.query(
      `UPDATE "user" 
      SET name='${name}', phone='${phone}', auth='${auth}', status='${status}', updated_at=now() 
      WHERE id=${id}`
    );

    return res.status(200).json({
      message: '정보가 수정되었습니다.',
    });
  } catch (error: any) {
    console.error('/api/v1/web/user/edit >> ', error);

    return res.status(400).json({
      message: '정보 수정중 에러가 발생했습니다.',
    });
  }
});

export default UserRouter;
