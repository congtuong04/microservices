import bcrypt from 'bcrypt';
import { pool } from '../config';

export interface CreateUserInput {
  username: string;
  password: string;
  role?: string;
}

export interface UpdateUserInput {
  username?: string;
  password?: string;
  role?: string;
}

export interface SafeUser {
  id: number;
  username: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export async function findUserById(userId: number): Promise<SafeUser | null> {
  const [rows] = await pool.query(
    `SELECT id, username, role, created_at, updated_at
     FROM users
     WHERE id = ?`,
    [userId]
  );

  const users = rows as SafeUser[];
  return users.length ? users[0] : null;
}

export async function findUserByUsername(username: string): Promise<any | null> {
  const [rows] = await pool.query(
    `SELECT id, username, password, role, created_at, updated_at
     FROM users
     WHERE username = ?`,
    [username]
  );

  const users = rows as any[];
  return users.length ? users[0] : null;
}

export async function getAllUsers(): Promise<SafeUser[]> {
  const [rows] = await pool.query(
    `SELECT id, username, role, created_at, updated_at
     FROM users
     ORDER BY id ASC`
  );

  return rows as SafeUser[];
}

export async function createUser(input: CreateUserInput): Promise<SafeUser> {
  const { username, password } = input;
  const role = input.role || 'user';

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `INSERT INTO users (username, password, role)
     VALUES (?, ?, ?)`,
    [username, hashedPassword, role]
  );

  const insertResult = result as any;
  const createdUser = await findUserById(insertResult.insertId);

  if (!createdUser) {
    throw new Error('Failed to fetch created user');
  }

  return createdUser;
}

export async function updateUser(
  userId: number,
  input: UpdateUserInput
): Promise<SafeUser | null> {
  const fields: string[] = [];
  const values: any[] = [];

  if (input.username !== undefined) {
    fields.push('username = ?');
    values.push(input.username);
  }

  if (input.role !== undefined) {
    fields.push('role = ?');
    values.push(input.role);
  }

  if (input.password !== undefined) {
    const hashedPassword = await bcrypt.hash(input.password, 10);
    fields.push('password = ?');
    values.push(hashedPassword);
  }

  if (fields.length === 0) {
    return findUserById(userId);
  }

  values.push(userId);

  await pool.query(
    `UPDATE users
     SET ${fields.join(', ')}
     WHERE id = ?`,
    values
  );

  return findUserById(userId);
}

export async function deleteUser(userId: number): Promise<boolean> {
  const [result] = await pool.query(
    `DELETE FROM users WHERE id = ?`,
    [userId]
  );

  const deleteResult = result as any;
  return deleteResult.affectedRows > 0;
}