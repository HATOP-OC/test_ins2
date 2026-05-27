import { Router } from 'express';
import { roomsController } from '../controllers/rooms.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { createRoomSchema, updateRoomSchema, roomIdParamSchema } from '../schemas/rooms.schema';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  validate(createRoomSchema),
  roomsController.create
);

router.get(
  '/',
  roomsController.findAll
);

router.get(
  '/:id',
  validate(roomIdParamSchema, 'params'),
  roomsController.findById
);

router.put(
  '/:id',
  validate(roomIdParamSchema, 'params'),
  validate(updateRoomSchema),
  roomsController.update
);

router.delete(
  '/:id',
  validate(roomIdParamSchema, 'params'),
  roomsController.delete
);

export default router;
