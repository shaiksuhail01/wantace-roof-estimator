import express from 'express';

import {
  login,
  me,
  logout,
} from '../controllers/authController.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);

router.get('/me', authMiddleware, me);

router.post('/logout', logout);

export default router;