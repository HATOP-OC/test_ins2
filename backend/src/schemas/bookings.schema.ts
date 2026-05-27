import { z } from 'zod';

export const createBookingSchema = z
  .object({
    startTime: z.string().datetime('Invalid start time format'),
    endTime: z.string().datetime('Invalid end time format'),
    description: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export const updateBookingSchema = z
  .object({
    startTime: z.string().datetime('Invalid start time format').optional(),
    endTime: z.string().datetime('Invalid end time format').optional(),
    description: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

export const bookingParamsSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  id: z.string().min(1, 'Booking ID is required').optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
