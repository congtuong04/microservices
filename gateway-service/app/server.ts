import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

const app = express();
const port = Number(process.env.PORT) || Number(process.env.GATEWAY_SERVICE_PORT) || 3000;

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth:3000';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user:3000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Gateway OK');
});

app.use(
  '/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
  })
);

app.use(
  '/users',
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
  })
);

app.listen(port, '0.0.0.0', () => {
  console.log(`Gateway running on port ${port}`);
  console.log(`AUTH_SERVICE_URL: ${AUTH_SERVICE_URL}`);
  console.log(`USER_SERVICE_URL: ${USER_SERVICE_URL}`);
  console.log(`FRONTEND_URL: ${FRONTEND_URL}`);
});