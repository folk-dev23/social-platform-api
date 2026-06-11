import { Response } from 'express';
import { pool } from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT n.*, 
              u.username as actor_username,
              p.avatar_url as actor_avatar,
              post.content as post_content
       FROM notifications n
       JOIN users u ON n.actor_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN posts post ON n.post_id = post.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ notifications: result.rows, page, limit });

  } catch (error: any) {
    console.error('GetNotifications error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );

    res.json({ unread_count: parseInt(result.rows[0].count) });

  } catch (error: any) {
    console.error('GetUnreadCount error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({ message: 'Notification marked as read' });

  } catch (error: any) {
    console.error('MarkAsRead error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );

    res.json({ message: 'All notifications marked as read' });

  } catch (error: any) {
    console.error('MarkAllAsRead error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createNotification = async (
  userId: string,
  actorId: string,
  type: string,
  postId?: string,
  commentId?: string
): Promise<void> => {
  try {
    // Don't notify yourself
    if (userId === actorId) return;

    await pool.query(
      `INSERT INTO notifications (user_id, actor_id, type, post_id, comment_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, actorId, type, postId || null, commentId || null]
    );
  } catch (error: any) {
    console.error('CreateNotification error:', error.message);
  }
};