import express from 'express';
import ManagementRouter from './management/router';
import MemberRouter from './member/router';
import MenuRouter from './menu/router';
import OrderRouter from './order/router';
import SalesRouter from './sales/router';
import UserRouter from './user/router';

const WebRouter = express.Router();

WebRouter.use('/user', UserRouter);
WebRouter.use('/member', MemberRouter);
WebRouter.use('/menu', MenuRouter);
WebRouter.use('/management', ManagementRouter);
WebRouter.use('/order', OrderRouter);
WebRouter.use('/sales', SalesRouter);

export default WebRouter;
