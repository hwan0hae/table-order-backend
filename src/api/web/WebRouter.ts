import express from 'express';

import MemberRouter from './member/router';
import MenuRouter from './menu/router';
import UserRouter from './user/router';

const WebRouter = express.Router();

WebRouter.use('/user', UserRouter);
WebRouter.use('/member', MemberRouter);
WebRouter.use('/menu', MenuRouter);

export default WebRouter;
