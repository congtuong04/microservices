import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';

import { generateToken } from './jwt';
import { verifyToken, AuthRequest } from './auth.middleware';

const router = Router();

// 🔷 MySQL connection
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'db',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'user',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'DB_NAME',
});

// 🔷 Get client IP (Render compatible)
const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0];
  }
  return req.socket.remoteAddress || req.ip || 'unknown';
};

// 🔷 Login history logger
const logLogin = async (
  userId: number | null,
  username: string,
  status: 'SUCCESS' | 'FAILED',
  ip: string
) => {
  try {
    await pool.execute(
      `INSERT INTO login_history (user_id, username, status, ip_address)
       VALUES (?, ?, ?, ?)`,
      [userId, username, status, ip]
    );
  } catch (err) {
    console.error('Login log error:', err);
  }
};

// 🔷 Audit logger middleware
const auditLog = (action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);

    res.on('finish', async () => {
      try {
        await pool.execute(
          `INSERT INTO audit_logs 
          (user_id, username, role, action, endpoint, method, status, ip_address)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user?.userId || null,
            req.user?.username || 'unknown',
            req.user?.role || 'unknown',
            action,
            req.originalUrl,
            req.method,
            res.statusCode,
            ip,
          ]
        );
      } catch (err) {
        console.error('Audit log error:', err);
      }
    });

    next();
  };
};

// 🔷 LOGIN API
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required',
      });
    }

    const ip = getClientIp(req);

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

    // ❌ User not found
    if (users.length === 0) {
      await logLogin(null, username, 'FAILED', ip);

      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const user = users[0];

    // ❌ Wrong password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logLogin(user.id, username, 'FAILED', ip);

      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // ✅ SUCCESS
    await logLogin(user.id, username, 'SUCCESS', ip);

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
});

// 🔷 UPDATE USER
router.put(
  '/users/:id',
  verifyToken,
  auditLog('UPDATE_USER'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ message: 'Username required' });
      }

      if (req.user?.role !== 'admin' && req.user?.userId !== Number(id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await pool.execute(
        'UPDATE users SET username = ? WHERE id = ?',
        [username, id]
      );

      return res.json({ message: 'User updated' });
    } catch (err) {
      return res.status(500).json({ message: 'Error updating user' });
    }
  }
);

// 🔷 DELETE USER (admin only)
router.delete(
  '/users/:id',
  verifyToken,
  auditLog('DELETE_USER'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
      }

      const { id } = req.params;

      await pool.execute('DELETE FROM users WHERE id = ?', [id]);

      return res.json({ message: 'User deleted' });
    } catch (err) {
      return res.status(500).json({ message: 'Error deleting user' });
    }
  }
);

// 🔷 PROFILE (test JWT)
router.get('/profile', verifyToken, (req: AuthRequest, res: Response) => {
  return res.status(200).json({
    message: 'Protected route success',
    user: req.user,
  });
});

router.get('/audit-logs', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50'
    );

    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching audit logs' });
  }
});

router.get('/login-history', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM login_history ORDER BY id DESC LIMIT 50'
    );

    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching login history' });
  }
});

export default router;