import { Response } from 'express';
import { pool } from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';

export const followUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const followerId = req.user?.userId;

    // Find target user
    const targetUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (targetUser.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const followingId = targetUser.rows[0].id;

    // Prevent self-follow
    if (followerId === followingId) {
      res.status(400).json({ message: 'You cannot follow yourself' });
      return;
    }

    // Follow
    await pool.query(
      `INSERT INTO follows (follower_id, following_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [followerId, followingId]
    );

    res.json({ message: `You are now following ${username}` });

  } catch (error: any) {
    console.error('FollowUser error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const unfollowUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const followerId = req.user?.userId;

    const targetUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (targetUser.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const followingId = targetUser.rows[0].id;

    await pool.query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );

    res.json({ message: `You have unfollowed ${username}` });

  } catch (error: any) {
    console.error('UnfollowUser error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFollowers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const result = await pool.query(
      `SELECT u.id, u.username, p.display_name, p.avatar_url
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE f.following_id = (SELECT id FROM users WHERE username = $1)
       ORDER BY f.created_at DESC`,
      [username]
    );

    res.json({ followers: result.rows });

  } catch (error: any) {
    console.error('GetFollowers error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFollowing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const result = await pool.query(
      `SELECT u.id, u.username, p.display_name, p.avatar_url
       FROM follows f
       JOIN users u ON f.following_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE f.follower_id = (SELECT id FROM users WHERE username = $1)
       ORDER BY f.created_at DESC`,
      [username]
    );

    res.json({ following: result.rows });

  } catch (error: any) {
    console.error('GetFollowing error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};