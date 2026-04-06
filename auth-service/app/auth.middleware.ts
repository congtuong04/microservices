import { NextFunction, Request, Response } from 'express';
import { verifyJwtToken } from './jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
}

export function verifyToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      message: 'Missing or invalid Authorization header',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyJwtToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
}