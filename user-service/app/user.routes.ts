import { Router } from 'express';
import { verifyToken } from './auth.middleware';
import { authorizeRoles } from './role.middleware';
import {
  createUserHandler,
  deleteUserHandler,
  getMeHandler,
  getUsersHandler,
  updateUserHandler,
} from './user.controller';

const router = Router();

// User self-service
router.get('/users/me', verifyToken, getMeHandler);

// Update user:
// - admin sửa được mọi user
// - user thường chỉ sửa được chính mình
router.put('/users/:id', verifyToken, updateUserHandler);

// Admin routes
router.get('/users', verifyToken, authorizeRoles('admin'), getUsersHandler);
router.post('/users', verifyToken, authorizeRoles('admin'), createUserHandler);
router.delete('/users/:id', verifyToken, authorizeRoles('admin'), deleteUserHandler);

export default router;