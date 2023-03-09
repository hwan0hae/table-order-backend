import socketIO, { Socket } from 'socket.io';
import { server } from '../app';

const socketArr = new Array<Socket>();

export const io = new socketIO.Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socketArr.push(socket);
  console.log('New client connected');

  socket.on('disconnect', () => console.log('user disconnect', socket.id));

  socket.on('error', (error) => {
    console.error(error);
  });
});
