import { Router } from 'express';
import { register } from './auth.controller';

const router = Router();

router.post('/register', register);

router.post('/login', (req, res) => {
  res.json({ message: 'login endpoint' });
});

export default router;