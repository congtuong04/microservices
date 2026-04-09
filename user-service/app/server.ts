import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import './express';
import userRoutes from './user.routes';
import { initializeDatabase } from '../config';

const app = express();
const port = Number(process.env.PORT) || Number(process.env.USER_SERVICE_PORT) || 3000;

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

// Database
initializeDatabase();

// Routes
app.get('/', (_req, res) => {
  res.send('User Service Status: OK');
});

app.use(userRoutes);

// Listen
app.listen(port, '0.0.0.0', () => {
  console.log(`User Service is running on port ${port}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});