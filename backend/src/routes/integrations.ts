import { Router } from 'express';

const router = Router();

// Stub for integration routes
router.get('/list', (req, res) => {
  res.json({ success: true, message: 'Integrations list stub' });
});

export default router;
