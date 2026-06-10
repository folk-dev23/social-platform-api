import { Router } from 'express';
import {
  createPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
} from './posts.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', requireAuth, createPost);
router.put('/:id', requireAuth, updatePost);
router.delete('/:id', requireAuth, deletePost);

export default router;