import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from './notifications.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getNotifications);
router.get('/unread-count', requireAuth, getUnreadCount);
router.put('/:id/read', requireAuth, markAsRead);
router.put('/read-all', requireAuth, markAllAsRead);

export default router;