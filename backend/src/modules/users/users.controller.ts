import { Response } from 'express';
import { pool } from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.role, u.is_verified, u.created_at,
              p.display_name, p.bio, p.avatar_url, p.banner_url, p.location, p.website
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user: result.rows[0] });

  } catch (error: any) {
    console.error('GetProfile error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { display_name, bio, location, website } = req.body;
    const userId = req.user?.userId;

    // Upsert profile
    const result = await pool.query(
      `INSERT INTO profiles (user_id, display_name, bio, location, website)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         bio = EXCLUDED.bio,
         location = EXCLUDED.location,
         website = EXCLUDED.website,
         updated_at = NOW()
       RETURNING *`,
      [userId, display_name, bio, location, website]
    );

    res.json({
      message: 'Profile updated successfully',
      profile: result.rows[0],
    });

  } catch (error: any) {
    console.error('UpdateProfile error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};