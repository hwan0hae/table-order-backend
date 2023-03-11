import express, { Request, Response } from 'express';
import { signUpCheck, validate } from '../../../middleware/validator';
import { SignUp } from '../../../types/api';
import { client } from '../../../db/db';
import bcrypt from 'bcrypt';

export const UserRouter = express.Router();

UserRouter.post(
  '/signup',
  ...validate(signUpCheck),
  (req: Request, res: Response) => {
    const { body }: { body: SignUp } = req;
    // console.log(body);
    const salt = process.env.HASH_SALT;

    return res.status(200).json({ a: salt });
    // try {
    //   /** 회사 데이터가 있다면 company 생성 */
    //   if (body.companyName && body.companyNumber) {
    //     const createdCompany = await client.query(
    //       `INSERT INTO company (name, company_number) VALUES
    //       (${body.companyName},${body.companyNumber})`
    //     );
    //     console.log(createdCompany);

    //     /** OWNER user 생성 */
    //     const hashPassword = await bcrypt.hash(body.password, salt);
    //     const { companyName, companyNumber, ...userInfo } = body;
    //     const userData: UserSignUp = {
    //       ...userInfo,
    //       password: hashPassword,
    //       auth: 'OWNER',
    //       companyId: 6,
    //     };
    //     // companyId jwt > 데이터 가져와서 넣을것 !

    //     const createdUser = await client.query(
    //       `INSERT INTO user (email, password, name, phone, auth,company_id) VALUES
    //       (${userData.email},${userData.password},${userData.name},${userData.phone},${userData.auth},${userData.companyId})`
    //     );
    //     console.log(createdUser);

    //     return res.status(200).json({
    //       company: createdCompany,
    //       user: createdUser,
    //       message: '회원가입에 성공했습니다. 로그인 페이지로 이동합니다.',
    //     });
    //   }
    // } catch (error: any) {
    //   console.error('/api/v1/web/user/signup >> ', error);

    //   if (0) {
    //     const errorType = error.meta?.target[0];
    //     switch (errorType) {
    //       case 'name':
    //         return res.status(409).json({
    //           user: null,
    //           message: '이미 가입된 회사명입니다.',
    //         });
    //       case 'companyNumber':
    //         return res.status(409).json({
    //           user: null,
    //           message: '이미 가입된 사업자 등록번호입니다.',
    //         });
    //       case 'email':
    //         return res.status(409).json({
    //           user: null,
    //           message: '이미 사용중인 이메일입니다.',
    //         });
    //       case 'phone':
    //         return res.status(409).json({
    //           user: null,
    //           message: '이미 사용중인 전화번호입니다.',
    //         });

    //       default:
    //         return res.status(409).json({
    //           user: null,
    //           message: '알 수 없는 에러입니다. 잠시후에 다시 시도해주세요!',
    //         });
    //     }
    //   }

    //   return res.status(400).json({
    //     error: error,
    //     message: '회원가입에 실패했습니다. 새로고침후에 시도해주세요!',
    //   });
    // }
  }
);
