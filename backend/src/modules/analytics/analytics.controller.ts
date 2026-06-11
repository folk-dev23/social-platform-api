import { Request, Response } from 'express';
import { pool } from '../../config/database';
import { redisClient } from '../../config/redis';

export const getOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'analytics:overview';
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.json({ ...JSON.parse(cached), cached: true });
      return;
    }

    // Total users
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');

    // New users today
    const newUsersToday = await pool.query(
      `SELECT COUNT(*) as count FROM users
       WHERE created_at > NOW() - INTERVAL '24 hours'`
    );

    // New users this week
    const newUsersWeek = await pool.query(
      `SELECT COUNT(*) as count FROM users
       WHERE created_at > NOW() - INTERVAL '7 days'`
    );

    // Total posts
    const totalPosts = await pool.query(
      'SELECT COUNT(*) as count FROM posts WHERE deleted_at IS NULL'
    );

    // Posts today
    const postsToday = await pool.query(
      `SELECT COUNT(*) as count FROM posts
       WHERE created_at > NOW() - INTERVAL '24 hours' AND deleted_at IS NULL`
    );

    // Total reactions
    const totalReactions = await pool.query('SELECT COUNT(*) as count FROM reactions');

    // Total comments
    const totalComments = await pool.query(
      'SELECT COUNT(*) as count FROM comments WHERE deleted_at IS NULL'
    );

    // Daily active users (logged in last 24h via refresh tokens)
    const dau = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as count FROM refresh_tokens
       WHERE created_at > NOW() - INTERVAL '24 hours'`
    );

    // Engagement rate (avg reactions per post)
    const engagementRate = await pool.query(
      `SELECT ROUND(AVG(reaction_count)::numeric, 2) as rate FROM (
         SELECT p.id, COUNT(r.id) as reaction_count
         FROM posts p
         LEFT JOIN reactions r ON p.id = r.post_id
         WHERE p.deleted_at IS NULL
         GROUP BY p.id
       ) sub`
    );

    const response = {
      total_users: parseInt(totalUsers.rows[0].count),
      new_users_today: parseInt(newUsersToday.rows[0].count),
      new_users_this_week: parseInt(newUsersWeek.rows[0].count),
      total_posts: parseInt(totalPosts.rows[0].count),
      posts_today: parseInt(postsToday.rows[0].count),
      total_reactions: parseInt(totalReactions.rows[0].count),
      total_comments: parseInt(totalComments.rows[0].count),
      daily_active_users: parseInt(dau.rows[0].count),
      engagement_rate: parseFloat(engagementRate.rows[0].rate) || 0,
      generated_at: new Date().toISOString(),
    };

    // Cache 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.json(response);

  } catch (error: any) {
    console.error('GetOverview error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserGrowth = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'analytics:user-growth';
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.json({ ...JSON.parse(cached), cached: true });
      return;
    }

    const result = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as new_users
       FROM users
       WHERE created_at > NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    const response = {
      user_growth: result.rows,
      generated_at: new Date().toISOString(),
    };

    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.json(response);

  } catch (error: any) {
    console.error('GetUserGrowth error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPostStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'analytics:post-stats';
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.json({ ...JSON.parse(cached), cached: true });
      return;
    }

    const result = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as posts_created
       FROM posts
       WHERE created_at > NOW() - INTERVAL '30 days'
         AND deleted_at IS NULL
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    const response = {
      post_stats: result.rows,
      generated_at: new Date().toISOString(),
    };

    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.json(response);

  } catch (error: any) {
    console.error('GetPostStats error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTopTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'analytics:top-tags';
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.json({ ...JSON.parse(cached), cached: true });
      return;
    }

    const result = await pool.query(
      `SELECT t.name, t.slug, COUNT(pt.post_id) as usage_count
       FROM tags t
       JOIN post_tags pt ON t.id = pt.tag_id
       GROUP BY t.id, t.name, t.slug
       ORDER BY usage_count DESC
       LIMIT 10`
    );

    const response = {
      top_tags: result.rows,
      generated_at: new Date().toISOString(),
    };

    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.json(response);

  } catch (error: any) {
    console.error('GetTopTags error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};