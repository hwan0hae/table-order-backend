import express from 'express';
import UserRouter from './user/router';

const WebRouter = express.Router();

WebRouter.use('/user', UserRouter);

export default WebRouter;
