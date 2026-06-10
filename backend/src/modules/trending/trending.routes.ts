import { Router } from 'express';
import { getTrendingPosts, getTrendingTags } from './trending.controller';

const router = Router();

router.get('/posts', getTrendingPosts);
router.get('/tags', getTrendingTags);

export default router;