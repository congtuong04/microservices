import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import './express';
import userRoutes from './user.routes';
import { initializeDatabase } from '../config';

const app = express();
const port = Number(process.env.PORT) || Number(process.env.USER_SERVICE_PORT) || 3000;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
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
});