import { z } from 'zod'

export const createRoomSchema = z.object({
  name: z.string().min(2, 'Room name must be at least 2 characters'),
  description: z.string().optional(),
})

export const updateRoomSchema = z.object({
  name: z.string().min(2, 'Room name must be at least 2 characters'),
  description: z.string().optional(),
})

export const addUserToRoomSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'USER'], {
    required_error: 'Please select a role',
  }),
})

export type CreateRoomFormData = z.infer<typeof createRoomSchema>
export type UpdateRoomFormData = z.infer<typeof updateRoomSchema>
export type AddUserToRoomFormData = z.infer<typeof addUserToRoomSchema>
