import { z } from 'zod';

export const addUserAccessSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['ADMIN', 'USER'], {
    errorMap: () => ({ message: 'Role must be ADMIN or USER' }),
  }),
});

export const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'USER'], {
    errorMap: () => ({ message: 'Role must be ADMIN or USER' }),
  }),
});

export const roomAccessParamsSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  userId: z.string().min(1, 'User ID is required').optional(),
});

export type AddUserAccessInput = z.infer<typeof addUserAccessSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
