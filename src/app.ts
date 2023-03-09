import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebRouter } from './api/web/WebRouter';
import dotenv from 'dotenv';
import { io } from './socket/socket';

dotenv.config();
const socketIO = io;

const API_VERSION = '/api/v1';
const WEB_API_URL = API_VERSION + '/web'
const APP_API_URL = API_VERSION + '/app'

const app = express();
export const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use(WEB_API_URL, WebRouter);
const port = process.env.PORT;
server.listen(port);
