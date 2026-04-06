import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

import { initializeDatabase } from '../config';
import authRoutes from './auth.routes';

const app = express();
const port = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());
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

console.log('JWT_SECRET:', process.env.JWT_SECRET);

app.listen(port, "0.0.0.0", () => {
  console.log(`Auth Service is running on port ${port}`);
});