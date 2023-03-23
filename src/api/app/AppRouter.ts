import express from 'express';
import MenuRouter from './menu/router';
import OrderRouter from './order/router';
import UserRouter from './user/router';

const AppRouter = express.Router();

AppRouter.use('/user', UserRouter);
AppRouter.use('/menu', MenuRouter);
AppRouter.use('/order', OrderRouter);

export default AppRouter;
