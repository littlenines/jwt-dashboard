import express from 'express';
import authRouter from './features/auth/auth.route';
import userRouter from './features/user/user.route';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);

export default router;
