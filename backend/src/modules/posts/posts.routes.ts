import { Router } from 'express';
import {
  createPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
} from './posts.controller';
import { reactToPost, getReactions, sharePost } from './reactions.controller';
import { addComment, getComments, deleteComment } from './comments.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// Posts
router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', requireAuth, createPost);
router.put('/:id', requireAuth, updatePost);
router.delete('/:id', requireAuth, deletePost);

// Reactions
router.post('/:id/react', requireAuth, reactToPost);
router.get('/:id/reactions', getReactions);

// Shares
router.post('/:id/share', requireAuth, sharePost);

// Comments
router.post('/:id/comments', requireAuth, addComment);
router.get('/:id/comments', getComments);
router.delete('/:id/comments/:commentId', requireAuth, deleteComment);

export default router;