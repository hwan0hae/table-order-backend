import express from 'express';
import MemberRouter from './member/router';
import UserRouter from './user/router';

const WebRouter = express.Router();

WebRouter.use('/user', UserRouter);
WebRouter.use('/member', MemberRouter);

export default WebRouter;
