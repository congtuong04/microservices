import { Request, Response, NextFunction } from 'express';
import mysql from 'mysql2/promise';
import { AuthRequest } from './auth.middleware';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'db',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'user',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'DB_NAME',
});

export const auditLog = (action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on('finish', async () => {
      try {
        await pool.execute(
          `INSERT INTO audit_logs 
          (user_id, username, role, action, endpoint, method, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user?.userId || null,
            req.user?.username || 'unknown',
            req.user?.role || 'unknown',
            action,
            req.originalUrl,
            req.method,
            res.statusCode,
          ]
        );
      } catch (err) {
        console.error('Audit log error:', err);
      }
    });

    next();
  };
};