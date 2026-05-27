import { apiClient } from './client'

export interface Booking {
  id: string
  roomId: string
  userId: string
  startTime: string
  endTime: string
  description: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export const bookingsApi = {
  getByRoom: async (roomId: string): Promise<{ bookings: Booking[] }> => {
    const response = await apiClient.get<Booking[] | { bookings: Booking[] }>(`/rooms/${roomId}/bookings`)
    const data = response.data
    const bookings = Array.isArray(data) ? data : data.bookings ?? []
    return { bookings }
  },

  create: async (
    roomId: string,
    startTime: string,
    endTime: string,
    description?: string
  ): Promise<{ booking: Booking }> => {
    const response = await apiClient.post<Booking>(`/rooms/${roomId}/bookings`, {
      startTime,
      endTime,
      description,
    })
    return { booking: response.data }
  },

  update: async (
    roomId: string,
    bookingId: string,
    startTime: string,
    endTime: string,
    description?: string
  ): Promise<{ booking: Booking }> => {
    const response = await apiClient.put<Booking>(`/rooms/${roomId}/bookings/${bookingId}`, {
      startTime,
      endTime,
      description,
    })
    return { booking: response.data }
  },

  delete: async (roomId: string, bookingId: string): Promise<void> => {
    await apiClient.delete(`/rooms/${roomId}/bookings/${bookingId}`)
  },
}
