import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const appAuthChecker = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token = req.header('Authorization');
  if (token) {
    token = token.replace(/^Bearer\s+/, '');
    try {
      const decoded = jwt.verify(
        token,
        String(process.env.JWT_ACCESS_SECRET)
      ) as JwtPayload;

      req.appCurrentUser = { id: decoded.id, tableNo: decoded.tableNo };
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
