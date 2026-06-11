import { Response } from 'express';
import { pool } from '../../config/database';
import { redisClient } from '../../config/redis';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getRecommendedUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const cacheKey = `recommendations:users:${userId}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.json({ ...JSON.parse(cached), cached: true });
      return;
    }

    // Friends of friends (people followed by people you follow)
    const fofResult = await pool.query(
      `SELECT DISTINCT u.id, u.username, p.display_name, p.avatar_url,
              'Followed by people you follow' as reason,
              COUNT(*) as mutual_count
       FROM follows f1
       JOIN follows f2 ON f1.following_id = f2.follower_id
       JOIN users u ON f2.following_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE f1.follower_id = $1
         AND f2.following_id != $1
         AND f2.following_id NOT IN (
           SELECT following_id FROM follows WHERE follower_id = $1
         )
       GROUP BY u.id, u.username, p.display_name, p.avatar_url
       ORDER BY mutual_count DESC
       LIMIT 5`,
      [userId]
    );

    // People with similar interests (same tags)
    const interestResult = await pool.query(
      `SELECT DISTINCT u.id, u.username, p.display_name, p.avatar_url,
              'Similar interests' as reason,
              COUNT(*) as common_tags
       FROM users u
       JOIN posts post ON u.id = post.user_id
       JOIN post_tags pt ON post.id = pt.post_id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE pt.tag_id IN (
         SELECT DISTINCT pt2.tag_id
         FROM reactions r
         JOIN post_tags pt2 ON r.post_id = pt2.post_id
         WHERE r.user_id = $1
       )
       AND u.id != $1
       AND u.id NOT IN (
         SELECT following_id FROM follows WHERE follower_id = $1
       )
       GROUP BY u.id, u.username, p.display_name, p.avatar_url
       ORDER BY common_tags DESC
       LIMIT 5`,
      [userId]
    );

    // Merge and deduplicate
    const seen = new Set();
    const recommended = [];

    for (const user of [...fofResult.rows, ...interestResult.rows]) {
      if (!seen.has(user.id)) {
        seen.add(user.id);
        recommended.push(user);
      }
    }

    const response = {
      recommended_users: recommended.slice(0, 8),
      generated_at: new Date().toISOString(),
    };

    // Cache 30 minutes
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(response));

    res.json(response);

  } catch (error: any) {
    console.error('GetRecommendedUsers error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRecommendedPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const cacheKey = `recommendations:posts:${userId}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.json({ ...JSON.parse(cached), cached: true });
      return;
    }

    // Posts with tags user has engaged with
    const tagBasedResult = await pool.query(
      `SELECT DISTINCT p.id, p.content, p.created_at,
              u.username, prof.display_name, prof.avatar_url,
              COUNT(DISTINCT r.id) as likes,
              'Matches your interests' as reason
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN profiles prof ON u.id = prof.user_id
       LEFT JOIN reactions r ON p.id = r.post_id
       JOIN post_tags pt ON p.id = pt.post_id
       WHERE pt.tag_id IN (
         SELECT DISTINCT pt2.tag_id
         FROM reactions r2
         JOIN post_tags pt2 ON r2.post_id = pt2.post_id
         WHERE r2.user_id = $1
       )
       AND p.user_id != $1
       AND p.deleted_at IS NULL
       AND p.id NOT IN (
         SELECT post_id FROM reactions WHERE user_id = $1
       )
       GROUP BY p.id, p.content, p.created_at, u.username, prof.display_name, prof.avatar_url
       ORDER BY likes DESC
       LIMIT 5`,
      [userId]
    );

    // Posts liked by people you follow
    const socialResult = await pool.query(
      `SELECT DISTINCT p.id, p.content, p.created_at,
              u.username, prof.display_name, prof.avatar_url,
              COUNT(DISTINCT r.id) as likes,
              'Popular with people you follow' as reason
       FROM follows f
       JOIN reactions r ON f.following_id = r.user_id
       JOIN posts p ON r.post_id = p.id
       JOIN users u ON p.user_id = u.id
       LEFT JOIN profiles prof ON u.id = prof.user_id
       WHERE f.follower_id = $1
         AND p.deleted_at IS NULL
         AND p.id NOT IN (
           SELECT post_id FROM reactions WHERE user_id = $1
         )
       GROUP BY p.id, p.content, p.created_at, u.username, prof.display_name, prof.avatar_url
       ORDER BY likes DESC
       LIMIT 5`,
      [userId]
    );

    // Merge and deduplicate
    const seen = new Set();
    const recommended = [];

    for (const post of [...tagBasedResult.rows, ...socialResult.rows]) {
      if (!seen.has(post.id)) {
        seen.add(post.id);
        recommended.push(post);
      }
    }

    const response = {
      recommended_posts: recommended.slice(0, 8),
      generated_at: new Date().toISOString(),
    };

    // Cache 30 minutes
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(response));

    res.json(response);

  } catch (error: any) {
    console.error('GetRecommendedPosts error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};