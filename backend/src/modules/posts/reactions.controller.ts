import { Response } from 'express';
import { pool } from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';
import { createNotification } from '../notifications/notifications.controller';

export const reactToPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId as string;

    const post = await pool.query(
      'SELECT id, user_id FROM posts WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (post.rows.length === 0) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const existing = await pool.query(
      'SELECT id FROM reactions WHERE user_id = $1 AND post_id = $2',
      [userId, id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM reactions WHERE user_id = $1 AND post_id = $2',
        [userId, id]
      );
      res.json({ message: 'Post unliked', liked: false });
    } else {
      await pool.query(
        'INSERT INTO reactions (user_id, post_id) VALUES ($1, $2)',
        [userId, id]
      );

      // Create notification
await createNotification(post.rows[0].user_id, userId, 'like', id as string);

      res.json({ message: 'Post liked', liked: true });
    }

  } catch (error: any) {
    console.error('ReactToPost error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getReactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT COUNT(*) as likes FROM reactions WHERE post_id = $1',
      [id]
    );

    res.json({ likes: parseInt(result.rows[0].likes) });

  } catch (error: any) {
    console.error('GetReactions error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const sharePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const post = await pool.query(
      'SELECT id FROM posts WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (post.rows.length === 0) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    await pool.query(
      'INSERT INTO shares (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, id]
    );

    res.json({ message: 'Post shared successfully' });

  } catch (error: any) {
    console.error('SharePost error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};