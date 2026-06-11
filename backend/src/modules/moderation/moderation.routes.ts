import { Router } from 'express';
import {
  reportContent,
  getReports,
  resolveReport,
  suspendUser,
  banUser,
  deletePostAdmin,
} from './moderation.controller';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// Any logged-in user can report
router.post('/reports', requireAuth, reportContent);

// Admin and moderator only
router.get('/reports', requireAuth, requireRole('admin', 'moderator'), getReports);
router.put('/reports/:id', requireAuth, requireRole('admin', 'moderator'), resolveReport);
router.post('/users/:id/suspend', requireAuth, requireRole('admin', 'moderator'), suspendUser);
router.post('/users/:id/ban', requireAuth, requireRole('admin'), banUser);
router.delete('/posts/:id', requireAuth, requireRole('admin', 'moderator'), deletePostAdmin);

export default router;