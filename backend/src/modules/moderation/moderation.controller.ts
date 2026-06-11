import { Response } from 'express';
import { pool } from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';

export const reportContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { target_type, target_id, reason } = req.body;
    const reporterId = req.user?.userId;

    if (!target_type || !target_id || !reason) {
      res.status(400).json({ message: 'target_type, target_id and reason are required' });
      return;
    }

    await pool.query(
      `INSERT INTO reports (reporter_id, target_type, target_id, reason)
       VALUES ($1, $2, $3, $4)`,
      [reporterId, target_type, target_id, reason]
    );

    res.status(201).json({ message: 'Report submitted successfully' });

  } catch (error: any) {
    console.error('ReportContent error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = req.query.status || 'pending';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT r.*, u.username as reporter_username
       FROM reports r
       JOIN users u ON r.reporter_id = u.id
       WHERE r.status = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    res.json({ reports: result.rows, page, limit });

  } catch (error: any) {
    console.error('GetReports error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resolveReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const reviewerId = req.user?.userId;

    if (!['reviewed', 'dismissed', 'actioned'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    await pool.query(
      `UPDATE reports SET status = $1, reviewed_by = $2, updated_at = NOW()
       WHERE id = $3`,
      [status, reviewerId, id]
    );

    res.json({ message: 'Report resolved successfully' });

  } catch (error: any) {
    console.error('ResolveReport error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const suspendUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason, days } = req.body;
    const adminId = req.user?.userId;

    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + (days || 7));

    await pool.query(
      `INSERT INTO user_suspensions (user_id, reason, suspended_until, created_by)
       VALUES ($1, $2, $3, $4)`,
      [id, reason, suspendedUntil, adminId]
    );

    await pool.query(
      'UPDATE users SET is_suspended = TRUE WHERE id = $1',
      [id]
    );

    res.json({ message: 'User suspended successfully' });

  } catch (error: any) {
    console.error('SuspendUser error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const banUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.userId;

    await pool.query(
      'UPDATE users SET is_banned = TRUE WHERE id = $1',
      [id]
    );

    res.json({ message: 'User banned successfully' });

  } catch (error: any) {
    console.error('BanUser error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePostAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE posts SET deleted_at = NOW() WHERE id = $1',
      [id]
    );

    res.json({ message: 'Post removed successfully' });

  } catch (error: any) {
    console.error('DeletePostAdmin error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};