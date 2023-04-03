import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import WebRouter from './api/web/WebRouter';
import socketServer from './socket/socket';
import AppRouter from './api/app/AppRouter';

dotenv.config();

const API_VERSION = '/api/v1';
const WEB_API_URL = `${API_VERSION}/web`;
const APP_API_URL = `${API_VERSION}/app`;

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(WEB_API_URL, WebRouter);
app.use(APP_API_URL, AppRouter);
socketServer(server);

const port = process.env.PORT;
server.listen(port);
