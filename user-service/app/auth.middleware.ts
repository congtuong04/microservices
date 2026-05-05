import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 🔷 Define payload
interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

// 🔷 Extend Request (QUAN TRỌNG)
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// 🔷 Middleware
export function verifyToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // ✅ FIX: giờ không lỗi nữa
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}