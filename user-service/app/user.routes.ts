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

// Admin routes
router.get('/users', verifyToken, authorizeRoles('admin'), getUsersHandler);
router.post('/users', verifyToken, authorizeRoles('admin'), createUserHandler);
router.put('/users/:id', verifyToken, authorizeRoles('admin'), updateUserHandler);
router.delete('/users/:id', verifyToken, authorizeRoles('admin'), deleteUserHandler);

export default router;