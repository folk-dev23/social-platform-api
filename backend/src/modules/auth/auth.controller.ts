import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../../config/database';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      res.status(400).json({ message: 'Username, email and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    // Check if email already exists
    const emailExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (emailExists.rows.length > 0) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    // Check if username already exists
    const usernameExists = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    if (usernameExists.rows.length > 0) {
      res.status(409).json({ message: 'Username already in use' });
      return;
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, role, is_verified, created_at`,
      [username, email, password_hash]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'Registration successful',
      user,
    });

  } catch (error: any) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};