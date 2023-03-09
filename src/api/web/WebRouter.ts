import express from 'express';
import { UserRouter } from './user/router';

export const WebRouter = express.Router();

WebRouter.use('/user', UserRouter);
