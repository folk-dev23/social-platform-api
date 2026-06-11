import { Router } from 'express';
import { getRecommendedUsers, getRecommendedPosts } from './recommendations.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/users', requireAuth, getRecommendedUsers);
router.get('/posts', requireAuth, getRecommendedPosts);

export default router;