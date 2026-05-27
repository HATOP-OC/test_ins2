import { Router } from 'express';
import { rolesController } from '../controllers/roles.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { addUserAccessSchema, updateRoleSchema } from '../schemas/roles.schema';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  '/',
  validate(addUserAccessSchema),
  rolesController.addUserAccess
);

router.get(
  '/',
  rolesController.listRoomAccess
);

router.put(
  '/:userId',
  validate(updateRoleSchema),
  rolesController.updateUserRole
);

router.delete(
  '/:userId',
  rolesController.removeUserAccess
);

export default router;
