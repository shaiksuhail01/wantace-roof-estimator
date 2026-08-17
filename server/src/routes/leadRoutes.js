import express from 'express';

import {
  getLeads,
  getLeadById,
} from '../controllers/leadController.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getLeads);

router.get('/:leadId', getLeadById);

export default router;