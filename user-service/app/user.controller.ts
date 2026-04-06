import { Request, Response } from 'express';
import {
  createUser,
  deleteUser,
  findUserById,
  findUserByUsername,
  getAllUsers,
  updateUser,
} from './user.service';

const ALLOWED_ROLES = ['admin', 'user'];

export async function getMeHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('getMeHandler error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getUsersHandler(_req: Request, res: Response) {
  try {
    const users = await getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.error('getUsersHandler error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createUserHandler(req: Request, res: Response) {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'username and password are required',
      });
    }

    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        message: 'role must be admin or user',
      });
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        message: 'Username already exists',
      });
    }

    const user = await createUser({
      username,
      password,
      role,
    });

    return res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('createUserHandler error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateUserHandler(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    const { username, password, role } = req.body;

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const existingUser = await findUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        message: 'role must be admin or user',
      });
    }

    if (username) {
      const foundByUsername = await findUserByUsername(username);
      if (foundByUsername && foundByUsername.id !== userId) {
        return res.status(409).json({
          message: 'Username already exists',
        });
      }
    }

    const updatedUser = await updateUser(userId, {
      username,
      password,
      role,
    });

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('updateUserHandler error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteUserHandler(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    const currentUserId = req.user?.userId;

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    if (currentUserId === userId) {
      return res.status(400).json({
        message: 'You cannot delete your own account',
      });
    }

    const existingUser = await findUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const deleted = await deleteUser(userId);

    if (!deleted) {
      return res.status(500).json({
        message: 'Failed to delete user',
      });
    }

    return res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('deleteUserHandler error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}