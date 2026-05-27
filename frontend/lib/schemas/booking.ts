import { z } from 'zod'

export const createBookingSchema = z.object({
  date: z.date({
    required_error: 'Please select a date',
  }),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  description: z.string().optional(),
}).refine((data) => {
  const start = data.startTime.split(':').map(Number)
  const end = data.endTime.split(':').map(Number)
  const startMinutes = start[0] * 60 + start[1]
  const endMinutes = end[0] * 60 + end[1]
  return endMinutes > startMinutes
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
})

export type CreateBookingFormData = z.infer<typeof createBookingSchema>
