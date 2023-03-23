import { NextFunction, Request, Response } from 'express';
import {
  checkSchema,
  validationResult,
  Schema,
  Result,
} from 'express-validator';

const passwordRegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/;

const validate = (schema: Schema) => {
  return [
    checkSchema(schema),
    // eslint-disable-next-line consistent-return
    (req: Request, res: Response, next: NextFunction) => {
      const errors: Result = validationResult(req);
      console.log(errors);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }
      next();
    },
  ];
};

export const signUpCheck: Schema = {
  companyName: { in: 'body', isString: true, optional: true },
  companyNumber: { in: 'body', isNumeric: true, optional: true },
  email: {
    exists: { errorMessage: 'email을 입력해주세요.' },
    in: 'body',
    isEmail: { errorMessage: 'email 형식이 아닙니다.' },
  },
  password: {
    exists: { errorMessage: '비밀번호를 입력해주세요.' },
    in: 'body',
    isLength: {
      errorMessage: '패스워드는 최소 8자 이상 최대 16자 까지 입니다.',
      options: { min: 8, max: 16 },
    },
    matches: {
      options: passwordRegExp,
      errorMessage:
        '비밀번호 형식이 틀립니다. 영문, 숫자 포함 8자리를 입력해주세요.',
    },
  },
  name: {
    exists: { errorMessage: '이름을 입력해주세요.' },
    in: 'body',
  },
  phone: {
    exists: { errorMessage: '핸드폰 번호를 입력해주세요.' },
    in: 'body',
    isMobilePhone: { errorMessage: 'phone 형식이 아닙니다.' },
  },
};

export const signInCheck: Schema = {
  email: {
    exists: { errorMessage: 'email을 입력해주세요.' },
    in: 'body',
    isEmail: { errorMessage: 'email 형식이 아닙니다.' },
  },
  password: {
    exists: { errorMessage: '비밀번호를 입력해주세요.' },
    in: 'body',
    isLength: {
      errorMessage: '패스워드는 최소 8자 이상 최대 16자 까지 입니다.',
      options: { min: 8, max: 16 },
    },
    matches: {
      options: passwordRegExp,
      errorMessage:
        '비밀번호 형식이 틀립니다. 영문, 숫자 포함 8자리를 입력해주세요.',
    },
  },
};

export const menuAddCheck: Schema = {
  name: {
    exists: { errorMessage: '메뉴 이름을 입력해주세요.' },
    in: 'body',
  },
  price: { in: 'body', isNumeric: true, optional: true },
  description: { in: 'body', optional: true },
};

export const menuEditCheck: Schema = {
  id: {
    in: 'body',
  },
  name: {
    exists: { errorMessage: '메뉴 이름을 입력해주세요.' },
    in: 'body',
  },
  price: { in: 'body', isNumeric: true, optional: true },
  description: { in: 'body', optional: true },
};

export const menuDeleteCheck: Schema = {
  id: {
    in: 'body',
  },
};

/** App */
export const appSignInCheck: Schema = {
  email: {
    exists: { errorMessage: 'email을 입력해주세요.' },
    in: 'body',
    isEmail: { errorMessage: 'email 형식이 아닙니다.' },
  },
  password: {
    exists: { errorMessage: '비밀번호를 입력해주세요.' },
    in: 'body',
    isLength: {
      errorMessage: '패스워드는 최소 8자 이상 최대 16자 까지 입니다.',
      options: { min: 8, max: 16 },
    },
    matches: {
      options: passwordRegExp,
      errorMessage:
        '비밀번호 형식이 틀립니다. 영문, 숫자 포함 8자리를 입력해주세요.',
    },
  },
  tableNo: {
    exists: { errorMessage: 'table No를 입력해주세요.' },
    in: 'body',
    isNumeric: true,
  },
};

export const appAuthCheck: Schema = {
  accessToken: {
    in: 'body',
  },
  refreshToken: {
    in: 'body',
  },
};

export default validate;
