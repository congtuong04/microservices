import express from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

const app = express();
const port =
  Number(process.env.PORT) ||
  Number(process.env.GATEWAY_SERVICE_PORT) ||
  3000;

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || 'http://auth:3000';

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || 'http://user:3000';

const allowedOrigins = [
  'http://localhost:5173',
  'https://frontend-dxq0.onrender.com',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Gateway OK',
    authService: AUTH_SERVICE_URL,
    userService: USER_SERVICE_URL,
  });
});

app.use(
  '/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/auth${path}`,
    on: {
      proxyReq: fixRequestBody,
      error: (err, _req, res) => {
        console.error('Proxy /auth error:', err.message);

        const response = res as express.Response;
        if (!response.headersSent) {
          response.status(502).json({
            message: 'Auth service unavailable',
            error: err.message,
          });
        }
      },
    },
  })
);

app.use(
  '/users',
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/users${path}`,
    on: {
      proxyReq: fixRequestBody,
      error: (err, _req, res) => {
        console.error('Proxy /users error:', err.message);

        const response = res as express.Response;
        if (!response.headersSent) {
          response.status(502).json({
            message: 'User service unavailable',
            error: err.message,
          });
        }
      },
    },
  })
);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Gateway running on port ${port}`);
  console.log(`AUTH_SERVICE_URL: ${AUTH_SERVICE_URL}`);
  console.log(`USER_SERVICE_URL: ${USER_SERVICE_URL}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});