import { prisma } from '../lib/prisma';
import { CreateRoomInput, UpdateRoomInput } from '../schemas/rooms.schema';
import { RoomRole } from '@prisma/client';
import { ForbiddenError } from '../errors/custom.error';

export class RoomsService {
  async create(userId: string, data: CreateRoomInput) {
    const room = await prisma.$transaction(async (tx) => {
      const newRoom = await tx.room.create({
        data: {
          name: data.name,
          description: data.description,
        },
      });

      await tx.roomAccess.create({
        data: {
          roomId: newRoom.id,
          userId: userId,
          role: RoomRole.ADMIN,
        },
      });

      return newRoom;
    });

    return room;
  }

  async findAllForUser(userId: string) {
    const rooms = await prisma.room.findMany({
      where: {
        roomAccess: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        roomAccess: {
          where: { userId: userId },
          select: { role: true },
        },
        _count: {
          select: { bookings: true },
        },
      },
    });

    return rooms.map((room) => ({
      ...room,
      userRole: room.roomAccess[0]?.role,
      roomAccess: undefined,
    }));
  }

  async findById(roomId: string, userId: string) {
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        roomAccess: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        roomAccess: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!room) {
      return null;
    }

    const userAccess = room.roomAccess.find((ra) => ra.userId === userId);

    return {
      ...room,
      userRole: userAccess?.role,
    };
  }

  async update(roomId: string, userId: string, data: UpdateRoomInput) {
    const access = await this.getUserRoomRole(roomId, userId);

    if (access !== RoomRole.ADMIN) {
      throw new ForbiddenError('Only room admins can update the room');
    }

    const room = await prisma.room.update({
      where: { id: roomId },
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return room;
  }

  async delete(roomId: string, userId: string) {
    const access = await this.getUserRoomRole(roomId, userId);

    if (access !== RoomRole.ADMIN) {
      throw new ForbiddenError('Only room admins can delete the room');
    }

    await prisma.room.delete({
      where: { id: roomId },
    });
  }

  async getUserRoomRole(roomId: string, userId: string): Promise<RoomRole | null> {
    const access = await prisma.roomAccess.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    return access?.role ?? null;
  }

  async checkRoomExists(roomId: string): Promise<boolean> {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });
    return !!room;
  }
}

export const roomsService = new RoomsService();
