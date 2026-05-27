import { Router } from 'express';
import authRoutes from './auth.routes';
import roomsRoutes from './rooms.routes';
import rolesRoutes from './roles.routes';
import bookingsRoutes from './bookings.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/rooms', roomsRoutes);
router.use('/rooms/:roomId/access', rolesRoutes);
router.use('/rooms/:roomId/bookings', bookingsRoutes);

export default router;
