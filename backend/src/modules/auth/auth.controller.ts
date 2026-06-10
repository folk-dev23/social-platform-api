import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/database';

const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as jwt.SignOptions
  );
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'Username, email and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    const emailExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (emailExists.rows.length > 0) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    const usernameExists = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    if (usernameExists.rows.length > 0) {
      res.status(409).json({ message: 'Username already in use' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, role, is_verified, created_at`,
      [username, email, password_hash]
    );

    const user = result.rows[0];

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken]
    );

    res.status(201).json({
      message: 'Registration successful',
      accessToken,
      refreshToken,
      user,
    });

  } catch (error: any) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0];

    if (user.is_banned) {
      res.status(403).json({ message: 'Your account has been banned' });
      return;
    }

    if (user.is_suspended) {
      res.status(403).json({ message: 'Your account has been suspended' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken]
    );

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
    });

  } catch (error: any) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};