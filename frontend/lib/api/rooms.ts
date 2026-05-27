import { apiClient } from './client'

export interface Room {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface RoomWithAccess extends Room {
  role: 'ADMIN' | 'USER'
}

export interface RoomAccess {
  id: string
  roomId: string
  userId: string
  role: 'ADMIN' | 'USER'
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface RoomDetail extends Room {
  role: 'ADMIN' | 'USER'
  users: RoomAccess[]
}

interface BackendRoom extends Room {
  userRole?: 'ADMIN' | 'USER' | null
}

interface BackendRoomDetail extends Room {
  userRole?: 'ADMIN' | 'USER' | null
  roomAccess?: RoomAccess[]
}

function normalizeRoom(room: BackendRoom): RoomWithAccess {
  return {
    ...room,
    role: room.userRole ?? 'USER',
  }
}

function normalizeRoomDetail(room: BackendRoomDetail): RoomDetail {
  return {
    ...room,
    role: room.userRole ?? 'USER',
    users: room.roomAccess ?? [],
  }
}

export const roomsApi = {
  getAll: async (): Promise<{ rooms: RoomWithAccess[] }> => {
    const response = await apiClient.get<BackendRoom[] | { rooms: BackendRoom[] }>('/rooms')
    const data = response.data
    const rooms = Array.isArray(data) ? data : data.rooms ?? []
    return { rooms: rooms.map(normalizeRoom) }
  },

  getById: async (id: string): Promise<{ room: RoomDetail }> => {
    const response = await apiClient.get<BackendRoomDetail | { room: BackendRoomDetail }>(`/rooms/${id}`)
    const data = response.data
    const room = 'room' in data ? data.room : data
    return { room: normalizeRoomDetail(room) }
  },

  create: async (name: string, description?: string): Promise<{ room: Room }> => {
    const response = await apiClient.post<Room>('/rooms', { name, description })
    return { room: response.data }
  },

  update: async (id: string, name: string, description?: string): Promise<{ room: Room }> => {
    const response = await apiClient.put<Room>(`/rooms/${id}`, { name, description })
    return { room: response.data }
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/rooms/${id}`)
  },

  addUser: async (roomId: string, email: string, role: 'ADMIN' | 'USER'): Promise<{ access: RoomAccess }> => {
    const response = await apiClient.post<RoomAccess>(`/rooms/${roomId}/access`, { email, role })
    return { access: response.data }
  },

  updateUserRole: async (roomId: string, userId: string, role: 'ADMIN' | 'USER'): Promise<{ access: RoomAccess }> => {
    const response = await apiClient.put<RoomAccess>(`/rooms/${roomId}/access/${userId}`, { role })
    return { access: response.data }
  },

  removeUser: async (roomId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/rooms/${roomId}/access/${userId}`)
  },
}
