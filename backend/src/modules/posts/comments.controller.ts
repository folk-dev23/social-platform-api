import { Response } from 'express';
import { pool } from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, parent_id } = req.body;
    const userId = req.user?.userId;

    if (!content || content.trim() === '') {
      res.status(400).json({ message: 'Content is required' });
      return;
    }

    const post = await pool.query(
      'SELECT id FROM posts WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (post.rows.length === 0) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO comments (user_id, post_id, parent_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, id, parent_id || null, content.trim()]
    );

    res.status(201).json({
      message: 'Comment added successfully',
      comment: result.rows[0],
    });

  } catch (error: any) {
    console.error('AddComment error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.*, u.username, p.avatar_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE c.post_id = $1 AND c.deleted_at IS NULL
       ORDER BY c.created_at ASC`,
      [id]
    );

    res.json({ comments: result.rows });

  } catch (error: any) {
    console.error('GetComments error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.userId;

    const result = await pool.query(
      `UPDATE comments SET deleted_at = NOW()
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [commentId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Comment not found or unauthorized' });
      return;
    }

    res.json({ message: 'Comment deleted successfully' });

  } catch (error: any) {
    console.error('DeleteComment error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};