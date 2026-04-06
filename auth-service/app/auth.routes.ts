import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';

import { generateToken } from './jwt';
import { verifyToken, AuthRequest } from './auth.middleware';

const router = Router();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'db',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'user',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'DB_NAME',
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        message: 'Username and password are required',
      });
      return;
    }

    const [rows] = await pool.execute(
      'SELECT id, username, password, role FROM users WHERE username = ? LIMIT 1',
      [username]
    );

    const users = rows as Array<{
      id: number;
      username: string;
      password: string;
      role: string;
    }>;

    if (users.length === 0) {
      res.status(401).json({
        message: 'Invalid credentials',
      });
      return;
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({
        message: 'Invalid credentials',
      });
      return;
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

router.get('/profile', verifyToken, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    message: 'Protected route success',
    user: req.user,
  });
});

export default router;