import { Request, Response } from 'express';
import { roomsService } from '../services/rooms.service';
import { CreateRoomInput, UpdateRoomInput } from '../schemas/rooms.schema';
import { CustomError } from '../errors/custom.error';

export class RoomsController {
  create = async (req: Request<object, object, CreateRoomInput>, res: Response): Promise<void> => {
    try {
      const room = await roomsService.create(req.user!.id, req.body);
      res.status(201).json(room);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
    }
  };

  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const rooms = await roomsService.findAllForUser(req.user!.id);
      res.status(200).json(rooms);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  findById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const room = await roomsService.findById(req.params.id, req.user!.id);
      res.status(200).json(room);
    } catch (error) {
      if (error instanceof CustomError) res.status(error.statusCode).json({ error: error.message });
      else res.status(500).json({ error: 'Internal server error' });
    }
  };

  update = async (
    req: Request<{ id: string }, object, UpdateRoomInput>,
    res: Response
  ): Promise<void> => {
    try {
      const room = await roomsService.update(req.params.id, req.user!.id, req.body);
      res.status(200).json(room);
    } catch (error) {
      if (error instanceof CustomError) res.status(error.statusCode).json({ error: error.message });
      else res.status(500).json({ error: 'Internal server error' });
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      await roomsService.delete(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof CustomError) res.status(error.statusCode).json({ error: error.message });
      else res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export const roomsController = new RoomsController();
