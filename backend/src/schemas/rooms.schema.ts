import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100),
  description: z.string().max(500).optional(),
});

export const updateRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100).optional(),
  description: z.string().max(500).optional(),
});

export const roomIdParamSchema = z.object({
  id: z.string().min(1, 'Room ID is required'),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
