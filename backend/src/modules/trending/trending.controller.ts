import { Request, Response } from 'express';
import { pool } from '../../config/database';
import { redisClient } from '../../config/redis';

export const getTrendingPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'trending:posts';
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.json({ ...JSON.parse(cached), cached: true });
      return;
    }

    const result = await pool.query(
      `SELECT
        p.id, p.content, p.created_at,
        u.username,
        prof.avatar_url, prof.display_name,
        COUNT(DISTINCT r.id) as likes,
        COUNT(DISTINCT c.id) as comments,
        COUNT(DISTINCT s.id) as shares,
        COUNT(DISTINCT r.id) + COUNT(DISTINCT c.id) * 2 + COUNT(DISTINCT s.id) * 3 as engagement_score,
        COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') as tags
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN profiles prof ON u.id = prof.user_id
       LEFT JOIN reactions r ON p.id = r.post_id AND r.created_at > NOW() - INTERVAL '24 hours'
       LEFT JOIN comments c ON p.id = c.post_id AND c.deleted_at IS NULL AND c.created_at > NOW() - INTERVAL '24 hours'
       LEFT JOIN shares s ON p.id = s.post_id AND s.created_at > NOW() - INTERVAL '24 hours'
       LEFT JOIN post_tags pt ON p.id = pt.post_id
       LEFT JOIN tags t ON pt.tag_id = t.id
       WHERE p.deleted_at IS NULL AND p.created_at > NOW() - INTERVAL '7 days'
       GROUP BY p.id, u.username, prof.avatar_url, prof.display_name
       ORDER BY engagement_score DESC
       LIMIT 10`
    );

    const response = {
      trending_posts: result.rows,
      generated_at: new Date().toISOString(),
    };

    // Cache 15 minutes
    await redisClient.setEx(cacheKey, 900, JSON.stringify(response));

    res.json(response);

  } catch (error: any) {
    console.error('GetTrendingPosts error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTrendingTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'trending:tags';
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.json({ ...JSON.parse(cached), cached: true });
      return;
    }

    const result = await pool.query(
      `SELECT
        t.name, t.slug,
        COUNT(DISTINCT pt.post_id) as post_count,
        COUNT(DISTINCT r.id) as total_likes
       FROM tags t
       JOIN post_tags pt ON t.id = pt.tag_id
       JOIN posts p ON pt.post_id = p.id
       LEFT JOIN reactions r ON p.id = r.post_id AND r.created_at > NOW() - INTERVAL '24 hours'
       WHERE p.deleted_at IS NULL AND p.created_at > NOW() - INTERVAL '7 days'
       GROUP BY t.id, t.name, t.slug
       ORDER BY post_count DESC, total_likes DESC
       LIMIT 10`
    );

    const response = {
      trending_tags: result.rows,
      generated_at: new Date().toISOString(),
    };

    // Cache 15 minutes
    await redisClient.setEx(cacheKey, 900, JSON.stringify(response));

    res.json(response);

  } catch (error: any) {
    console.error('GetTrendingTags error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};