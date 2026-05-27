import { prisma } from '../lib/prisma';
import { roomsService } from './rooms.service';
import { AddUserAccessInput, UpdateRoleInput } from '../schemas/roles.schema';
import { RoomRole } from '@prisma/client';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../errors/custom.error';

export class RolesService {
  async addUserAccess(roomId: string, requestingUserId: string, data: AddUserAccessInput) {
    const requestingUserRole = await roomsService.getUserRoomRole(roomId, requestingUserId);

    if (requestingUserRole !== RoomRole.ADMIN) {
      throw new ForbiddenError('Only room admins can add users');
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!targetUser) {
      throw new NotFoundError('User not found with this email');
    }

    const existingAccess = await prisma.roomAccess.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: targetUser.id,
        },
      },
    });

    if (existingAccess) {
      throw new ConflictError('User already has access to this room');
    }

    const access = await prisma.roomAccess.create({
      data: {
        roomId,
        userId: targetUser.id,
        role: data.role as RoomRole,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return access;
  }

  async listRoomAccess(roomId: string, requestingUserId: string) {
    const requestingUserRole = await roomsService.getUserRoomRole(roomId, requestingUserId);

    if (!requestingUserRole) {
      throw new ForbiddenError('Access denied');
    }

    const accessList = await prisma.roomAccess.findMany({
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
      orderBy: { createdAt: 'asc' },
    });

    return accessList;
  }

  async updateUserRole(
    roomId: string,
    targetUserId: string,
    requestingUserId: string,
    data: UpdateRoleInput
  ) {
    const requestingUserRole = await roomsService.getUserRoomRole(roomId, requestingUserId);

    if (requestingUserRole !== RoomRole.ADMIN) {
      throw new ForbiddenError('Only room admins can update roles');
    }

    const targetAccess = await prisma.roomAccess.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: targetUserId,
        },
      },
    });

    if (!targetAccess) {
      throw new NotFoundError('User does not have access to this room');
    }

    if (targetAccess.role === RoomRole.ADMIN && data.role === 'USER') {
      const adminCount = await prisma.roomAccess.count({
        where: {
          roomId,
          role: RoomRole.ADMIN,
        },
      });

      if (adminCount <= 1) {
        throw new BadRequestError('Cannot demote the last admin of the room');
      }
    }

    const updatedAccess = await prisma.roomAccess.update({
      where: {
        roomId_userId: {
          roomId,
          userId: targetUserId,
        },
      },
      data: {
        role: data.role as RoomRole,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedAccess;
  }

  async removeUserAccess(roomId: string, targetUserId: string, requestingUserId: string) {
    const requestingUserRole = await roomsService.getUserRoomRole(roomId, requestingUserId);

    if (requestingUserRole !== RoomRole.ADMIN) {
      throw new ForbiddenError('Only room admins can remove users');
    }

    const targetAccess = await prisma.roomAccess.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: targetUserId,
        },
      },
    });

    if (!targetAccess) {
      throw new NotFoundError('User does not have access to this room');
    }

    if (targetAccess.role === RoomRole.ADMIN) {
      const adminCount = await prisma.roomAccess.count({
        where: {
          roomId,
          role: RoomRole.ADMIN,
        },
      });

      if (adminCount <= 1) {
        throw new BadRequestError('Cannot remove the last admin of the room');
      }
    }

    await prisma.roomAccess.delete({
      where: {
        roomId_userId: {
          roomId,
          userId: targetUserId,
        },
      },
    });
  }
}

export const rolesService = new RolesService();
