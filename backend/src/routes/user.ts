import { Router } from 'express';

const router = Router();

// Stub for user routes
router.get('/profile', (req, res) => {
  res.json({ success: true, message: 'User profile stub' });
});

export default router;
