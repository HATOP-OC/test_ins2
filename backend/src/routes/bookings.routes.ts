import { Router } from 'express';
import { bookingsController } from '../controllers/bookings.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { createBookingSchema, updateBookingSchema } from '../schemas/bookings.schema';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  '/',
  validate(createBookingSchema),
  bookingsController.create
);

router.get(
  '/',
  bookingsController.findAll
);

router.get(
  '/:id',
  bookingsController.findById
);

router.put(
  '/:id',
  validate(updateBookingSchema),
  bookingsController.update
);

router.delete(
  '/:id',
  bookingsController.delete
);

export default router;
