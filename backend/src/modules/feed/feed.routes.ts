import { Router } from 'express';
import { getFeed, getPublicFeed } from './feed.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getFeed);
router.get('/public', getPublicFeed);

export default router;