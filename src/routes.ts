import express from 'express';
import authRouter from './features/auth/auth.route';

const router = express.Router();

router.use('/auth', authRouter);

export default router;
