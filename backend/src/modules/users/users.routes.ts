import { Router } from 'express';
import { getProfile, updateProfile } from './users.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/:username', getProfile);
router.put('/me', requireAuth, updateProfile);

export default router;