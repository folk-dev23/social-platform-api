import { Response } from 'express';
import { pool } from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, tags } = req.body;
    const userId = req.user?.userId;

    if (!content || content.trim() === '') {
      res.status(400).json({ message: 'Content is required' });
      return;
    }

    // Create post
    const result = await pool.query(
      `INSERT INTO posts (user_id, content)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, content.trim()]
    );

    const post = result.rows[0];

    // Handle tags
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        const slug = tagName.toLowerCase().replace(/\s+/g, '-');

        // Upsert tag
        const tagResult = await pool.query(
          `INSERT INTO tags (name, slug)
           VALUES ($1, $2)
           ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [tagName, slug]
        );

        // Link tag to post
        await pool.query(
          `INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [post.id, tagResult.rows[0].id]
        );
      }
    }

    res.status(201).json({
      message: 'Post created successfully',
      post,
    });

  } catch (error: any) {
    console.error('CreatePost error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, u.username, u.email,
              COALESCE(
                json_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '[]'
              ) as tags
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN post_tags pt ON p.id = pt.post_id
       LEFT JOIN tags t ON pt.tag_id = t.id
       WHERE p.id = $1 AND p.deleted_at IS NULL
       GROUP BY p.id, u.username, u.email`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.json({ post: result.rows[0] });

  } catch (error: any) {
    console.error('GetPost error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT p.*, u.username,
              COALESCE(
                json_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '[]'
              ) as tags
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN post_tags pt ON p.id = pt.post_id
       LEFT JOIN tags t ON pt.tag_id = t.id
       WHERE p.deleted_at IS NULL
       GROUP BY p.id, u.username
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      posts: result.rows,
      page,
      limit,
    });

  } catch (error: any) {
    console.error('GetPosts error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    if (!content || content.trim() === '') {
      res.status(400).json({ message: 'Content is required' });
      return;
    }

    const result = await pool.query(
      `UPDATE posts SET content = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [content.trim(), id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Post not found or unauthorized' });
      return;
    }

    res.json({
      message: 'Post updated successfully',
      post: result.rows[0],
    });

  } catch (error: any) {
    console.error('UpdatePost error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const result = await pool.query(
      `UPDATE posts SET deleted_at = NOW()
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Post not found or unauthorized' });
      return;
    }

    res.json({ message: 'Post deleted successfully' });

  } catch (error: any) {
    console.error('DeletePost error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};