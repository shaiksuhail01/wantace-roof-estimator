import express from 'express';

import { createEstimate } from '../controllers/estimateController.js';

const router = express.Router();

router.post('/', createEstimate);

export default router;