import express from 'express';

import {
  getPublicConfig,
  getAdminConfig,
  updateAdminConfig,
} from '../controllers/configController.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public estimator configuration
router.get('/', getPublicConfig);

// Protected admin configuration
router.get(
  '/admin',
  authMiddleware,
  getAdminConfig
);

router.put(
  '/admin',
  authMiddleware,
  updateAdminConfig
);

export default router;