import { Request, Response } from 'express';
import { rolesService } from '../services/roles.service';
import { AddUserAccessInput, UpdateRoleInput } from '../schemas/roles.schema';
import { CustomError } from '../errors/custom.error';

export class RolesController {
  addUserAccess = async (
    req: Request<{ roomId: string }, object, AddUserAccessInput>,
    res: Response
  ): Promise<void> => {
    try {
      const access = await rolesService.addUserAccess(req.params.roomId, req.user!.id, req.body);
      res.status(201).json(access);
    } catch (error) {
      if (error instanceof CustomError) res.status(error.statusCode).json({ error: error.message });
      else res.status(500).json({ error: 'Internal server error' });
    }
  };

  listRoomAccess = async (req: Request<{ roomId: string }>, res: Response): Promise<void> => {
    try {
      const accessList = await rolesService.listRoomAccess(req.params.roomId, req.user!.id);
      res.status(200).json(accessList);
    } catch (error) {
      if (error instanceof CustomError) res.status(error.statusCode).json({ error: error.message });
      else res.status(500).json({ error: 'Internal server error' });
    }
  };

  updateUserRole = async (
    req: Request<{ roomId: string; userId: string }, object, UpdateRoleInput>,
    res: Response
  ): Promise<void> => {
    try {
      const access = await rolesService.updateUserRole(req.params.roomId, req.params.userId, req.user!.id, req.body);
      res.status(200).json(access);
    } catch (error) {
      if (error instanceof CustomError) res.status(error.statusCode).json({ error: error.message });
      else res.status(500).json({ error: 'Internal server error' });
    }
  };

  removeUserAccess = async (
    req: Request<{ roomId: string; userId: string }>,
    res: Response
  ): Promise<void> => {
    try {
      await rolesService.removeUserAccess(req.params.roomId, req.params.userId, req.user!.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof CustomError) res.status(error.statusCode).json({ error: error.message });
      else res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export const rolesController = new RolesController();
