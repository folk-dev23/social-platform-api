import { Router } from 'express';
import {
  getOverview,
  getUserGrowth,
  getPostStats,
  getTopTags,
} from './analytics.controller';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';

const router = Router();

router.get('/overview', requireAuth, requireRole('admin', 'moderator'), getOverview);
router.get('/user-growth', requireAuth, requireRole('admin', 'moderator'), getUserGrowth);
router.get('/post-stats', requireAuth, requireRole('admin', 'moderator'), getPostStats);
router.get('/top-tags', requireAuth, requireRole('admin', 'moderator'), getTopTags);

export default router;