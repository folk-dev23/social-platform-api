import { Router } from 'express';
import { getProfile, updateProfile } from './users.controller';
import { followUser, unfollowUser, getFollowers, getFollowing } from './follow.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/:username', getProfile);
router.put('/me', requireAuth, updateProfile);
router.post('/:username/follow', requireAuth, followUser);
router.delete('/:username/follow', requireAuth, unfollowUser);
router.get('/:username/followers', getFollowers);
router.get('/:username/following', getFollowing);

export default router;