import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import client from '../../../db/db';
import authChecker from '../../../middleware/auth';
import validate, { signUpCheck } from '../../../middleware/validator';
import { IMemberSignUpData } from '../../../types/api';
import { IUserSignUp } from '../../../types/data';

const MemberRouter = express.Router();

/** 회사 Member 회원가입  */
MemberRouter.post(
  '/signup',
  ...validate(signUpCheck),
  authChecker,
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

/** 회사 멤버 리스트 겟 요청 */
MemberRouter.get('/list', authChecker, async (req: Request, res: Response) => {
  const user = req.currentUser;

  try {
    const result = await client.query(
      `SELECT id, email, name, phone, auth, status, created_at as "createdAt" , updated_at as "updatedAt"
      FROM "user" 
      WHERE company_id = '${user?.company_id}' AND status = '1'
      ORDER BY created_at ASC`
    );
    const memberList = result.rows;

    return res.status(200).json(memberList);
  } catch (error: any) {
    console.error('/api/v1/web/member/list >> ', error);

    return res.status(400).json({
      error,
      message: '유저목록을 불러올 수 없습니다.',
    });
  }
});

export default MemberRouter;
