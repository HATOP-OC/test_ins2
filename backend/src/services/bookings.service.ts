import { prisma } from '../lib/prisma';
import { roomsService } from './rooms.service';
import { CreateBookingInput, UpdateBookingInput } from '../schemas/bookings.schema';
import { RoomRole } from '@prisma/client';
import { ConflictError, ForbiddenError, NotFoundError } from '../errors/custom.error';

export class BookingsService {
  async create(roomId: string, userId: string, data: CreateBookingInput) {
    const userRole = await roomsService.getUserRoomRole(roomId, userId);

    if (!userRole) {
      throw new ForbiddenError('Access denied');
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    const conflict = await this.checkConflict(roomId, startTime, endTime);

    if (conflict) {
      throw new ConflictError('Booking conflicts with an existing booking');
    }

    const booking = await prisma.booking.create({
      data: {
        roomId,
        userId,
        startTime,
        endTime,
        description: data.description,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return booking;
  }

  async findAllForRoom(roomId: string, userId: string) {
    const userRole = await roomsService.getUserRoomRole(roomId, userId);

    if (!userRole) {
      throw new ForbiddenError('Access denied');
    }

    const bookings = await prisma.booking.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return bookings;
  }

  async findById(roomId: string, bookingId: string, userId: string) {
    const userRole = await roomsService.getUserRoomRole(roomId, userId);

    if (!userRole) {
      throw new ForbiddenError('Access denied');
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        roomId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return booking;
  }

  async update(
    roomId: string,
    bookingId: string,
    userId: string,
    data: UpdateBookingInput
  ) {
    const [userRole, booking] = await Promise.all([
      roomsService.getUserRoomRole(roomId, userId),
      prisma.booking.findFirst({
        where: { id: bookingId, roomId },
      }),
    ]);

    if (!userRole) {
      throw new ForbiddenError('Access denied');
    }

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (userRole === RoomRole.USER && booking.userId !== userId) {
      throw new ForbiddenError('You can only update your own bookings');
    }

    const startTime = data.startTime ? new Date(data.startTime) : booking.startTime;
    const endTime = data.endTime ? new Date(data.endTime) : booking.endTime;

    const conflict = await this.checkConflict(roomId, startTime, endTime, bookingId);

    if (conflict) {
      throw new ConflictError('Booking conflicts with an existing booking');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        startTime,
        endTime,
        description: data.description !== undefined ? data.description : booking.description,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedBooking;
  }

  async delete(roomId: string, bookingId: string, userId: string) {
    const [userRole, booking] = await Promise.all([
      roomsService.getUserRoomRole(roomId, userId),
      prisma.booking.findFirst({
        where: { id: bookingId, roomId },
      }),
    ]);

    if (!userRole) {
      throw new ForbiddenError('Access denied');
    }

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (userRole === RoomRole.USER && booking.userId !== userId) {
      throw new ForbiddenError('You can only delete your own bookings');
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });
  }

  private async checkConflict(
    roomId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ): Promise<boolean> {
    const conflict = await prisma.booking.findFirst({
      where: {
        roomId,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
        ],
      },
    });

    return !!conflict;
  }
}

export const bookingsService = new BookingsService();
