import { Response } from 'express';
import { pool } from '../../config/database';
import { redisClient } from '../../config/redis';
import { AuthRequest } from '../../middleware/auth.middleware';

const WEIGHTS = {
  like: 1.0,
  comment: 2.0,
  share: 3.0,
  follow_bonus: 5.0,
  interest_bonus: 3.0,
  decay_factor: 1.5,
};

const calculateScore = (
  likes: number,
  comments: number,
  shares: number,
  isFollowing: boolean,
  hasInterest: boolean,
  createdAt: Date
): number => {
  const hoursAgo = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  const timDecay = Math.pow(Math.max(hoursAgo, 0.1), WEIGHTS.decay_factor);

  const score =
    (likes * WEIGHTS.like +
      comments * WEIGHTS.comment +
      shares * WEIGHTS.share +
      (isFollowing ? WEIGHTS.follow_bonus : 0) +
      (hasInterest ? WEIGHTS.interest_bonus : 0)) /
    timDecay;

  return score;
};

const getFeedReason = (
  isFollowing: boolean,
  hasInterest: boolean,
  likes: number
): string => {
  if (isFollowing) return 'From someone you follow';
  if (hasInterest) return 'Matches your interests';
  if (likes > 10) return 'Popular post';
  return 'Trending now';
};

export const getFeed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Check Redis cache
    const cacheKey = `feed:${userId}:${page}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.json({ ...JSON.parse(cached), cached: true });
      return;
    }

    // Get following list
    const followingResult = await pool.query(
      'SELECT following_id FROM follows WHERE follower_id = $1',
      [userId]
    );
    const followingIds = followingResult.rows.map((r) => r.following_id);

    // Get user's interested tags (from posts they liked)
    const interestResult = await pool.query(
      `SELECT DISTINCT t.slug FROM tags t
       JOIN post_tags pt ON t.id = pt.tag_id
       JOIN reactions r ON pt.post_id = r.post_id
       WHERE r.user_id = $1`,
      [userId]
    );
    const interestedTags = interestResult.rows.map((r) => r.slug);

    // Get posts with engagement data
    const postsResult = await pool.query(
      `SELECT
        p.id, p.content, p.image_urls, p.created_at, p.user_id,
        u.username,
        prof.avatar_url, prof.display_name,
        COUNT(DISTINCT r.id) as likes,
        COUNT(DISTINCT c.id) as comments,
        COUNT(DISTINCT s.id) as shares,
        COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') as tags
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN profiles prof ON u.id = prof.user_id
       LEFT JOIN reactions r ON p.id = r.post_id
       LEFT JOIN comments c ON p.id = c.post_id AND c.deleted_at IS NULL
       LEFT JOIN shares s ON p.id = s.post_id
       LEFT JOIN post_tags pt ON p.id = pt.post_id
       LEFT JOIN tags t ON pt.tag_id = t.id
       WHERE p.deleted_at IS NULL
       GROUP BY p.id, u.username, prof.avatar_url, prof.display_name
       ORDER BY p.created_at DESC
       LIMIT 50`
    );

    // Score and rank posts
    const scoredPosts = postsResult.rows.map((post) => {
      const isFollowing = followingIds.includes(post.user_id);
      const hasInterest = post.tags.some((tag: string) =>
        interestedTags.includes(tag?.toLowerCase().replace(/\s+/g, '-'))
      );

      const score = calculateScore(
        parseInt(post.likes),
        parseInt(post.comments),
        parseInt(post.shares),
        isFollowing,
        hasInterest,
        post.created_at
      );

      const feed_reason = getFeedReason(isFollowing, hasInterest, parseInt(post.likes));

      return { ...post, score, feed_reason };
    });

    // Sort by score
    scoredPosts.sort((a, b) => b.score - a.score);

    // Paginate
    const offset = (page - 1) * limit;
    const paginatedPosts = scoredPosts.slice(offset, offset + limit);

    const response = {
      posts: paginatedPosts,
      page,
      limit,
      total: scoredPosts.length,
    };

    // Cache for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.json(response);

  } catch (error: any) {
    console.error('GetFeed error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPublicFeed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const cacheKey = `feed:public:${page}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.json({ ...JSON.parse(cached), cached: true });
      return;
    }

    const postsResult = await pool.query(
      `SELECT
        p.id, p.content, p.image_urls, p.created_at, p.user_id,
        u.username,
        prof.avatar_url, prof.display_name,
        COUNT(DISTINCT r.id) as likes,
        COUNT(DISTINCT c.id) as comments,
        COUNT(DISTINCT s.id) as shares,
        COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') as tags
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN profiles prof ON u.id = prof.user_id
       LEFT JOIN reactions r ON p.id = r.post_id
       LEFT JOIN comments c ON p.id = c.post_id AND c.deleted_at IS NULL
       LEFT JOIN shares s ON p.id = s.post_id
       LEFT JOIN post_tags pt ON p.id = pt.post_id
       LEFT JOIN tags t ON pt.tag_id = t.id
       WHERE p.deleted_at IS NULL
       GROUP BY p.id, u.username, prof.avatar_url, prof.display_name
       ORDER BY p.created_at DESC
       LIMIT 50`
    );

    const scoredPosts = postsResult.rows.map((post) => {
      const score = calculateScore(
        parseInt(post.likes),
        parseInt(post.comments),
        parseInt(post.shares),
        false,
        false,
        post.created_at
      );
      return { ...post, score, feed_reason: 'Trending now' };
    });

    scoredPosts.sort((a, b) => b.score - a.score);

    const offset = (page - 1) * limit;
    const paginatedPosts = scoredPosts.slice(offset, offset + limit);

    const response = {
      posts: paginatedPosts,
      page,
      limit,
      total: scoredPosts.length,
    };

    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.json(response);

  } catch (error: any) {
    console.error('GetPublicFeed error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};