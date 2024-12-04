import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import { errorMiddleware } from './Middlewares/ErrorMiddleware.js';
import { roomRouter } from './routes/room.route.js';
import { authRouter } from './routes/auth.route.js';
import { messageRouter } from './routes/message.route.js';
import cookieParser from 'cookie-parser';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3005;
const app = express();

app.use(express.json());
app.use(cors({
  credentials: true,
  origin: 'https://indigo04.github.io/chat-app/'
}));
app.use(cookieParser());
app.use(errorMiddleware);
app.use('/message', messageRouter)
app.use(authRouter);
app.use('/room', roomRouter);
app.get('/', (req, res) => {
  res.send(`PORT:${PORT}`);
});


const server = app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`)
})

export const wss = new WebSocketServer({ server });

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', ws => {
  ws.isAlive = true;
  ws.on('error', console.error);
  ws.on('pong', heartbeat)
})

const interval = setInterval(function ping() {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

wss.on('message', (message) => {
  const data = JSON.stringify({action: 'create', data: message})
  for (const client of wss.clients) {
    client.send(data)
  }
})

wss.on('remove', (message) => {
  const data = JSON.stringify({action: 'remove', data: message})
  for (const client of wss.clients) {
    client.send(data)
  }
})

wss.on('edit', (message) => {
  const data = JSON.stringify({action: 'edit', data: message})
  for (const client of wss.clients) {
    client.send(data)
  }
})
