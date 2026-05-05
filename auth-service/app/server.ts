import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

import { initializeDatabase } from '../config';
import authRoutes from './auth.routes';

const app = express();
const port = Number(process.env.PORT) || 3000;

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:5173,https://frontend-dxq0.onrender.com'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Database connection
initializeDatabase();

// Routes
app.get('/', (_req, res) => {
  res.send('Auth Service Status: OK');
});

app.use('/auth', authRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Auth Service is running on port ${port}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "auth-service",
    timestamp: new Date()
  });
});