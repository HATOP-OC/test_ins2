import { Request, Response } from 'express';
import { bookingsService } from '../services/bookings.service';
import { CreateBookingInput, UpdateBookingInput } from '../schemas/bookings.schema';
import { CustomError } from '../errors/custom.error';

export class BookingsController {
  create = async (
    req: Request<{ roomId: string }, object, CreateBookingInput>,
    res: Response
  ): Promise<void> => {
    try {
      const booking = await bookingsService.create(req.params.roomId, req.user!.id, req.body);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof CustomError) res.status(error.statusCode).json({ error: error.message });
      else res.status(500).json({ error: 'Internal server error' });
    }
  };

  findAll = async (req: Request<{ roomId: string }>, res: Response): Promise<void> => {
    try {
      const bookings = await bookingsService.findAllForRoom(req.params.roomId, req.user!.id);
      res.status(200).json(bookings);
    } catch (error) {
      if (error instanceof CustomError) res.status(error.statusCode).json({ error: error.message });
      else res.status(500).json({ error: 'Internal server error' });
    }
  };

  findById = async (
    req: Request<{ roomId: string; id: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const booking = await bookingsService.findById(req.params.roomId, req.params.id, req.user!.id);
      res.status(200).json(booking);
    } catch (error) {
      if (error instanceof CustomError) res.status(error.statusCode).json({ error: error.message });
      else res.status(500).json({ error: 'Internal server error' });
    }
  };

  update = async (
    req: Request<{ roomId: string; id: string }, object, UpdateBookingInput>,
    res: Response
  ): Promise<void> => {
    try {
      const booking = await bookingsService.update(req.params.roomId, req.params.id, req.user!.id, req.body);
      res.status(200).json(booking);
    } catch (error) {
      if (error instanceof CustomError) res.status(error.statusCode).json({ error: error.message });
      else res.status(500).json({ error: 'Internal server error' });
    }
  };

  delete = async (req: Request<{ roomId: string; id: string }>, res: Response): Promise<void> => {
    try {
      await bookingsService.delete(req.params.roomId, req.params.id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof CustomError) res.status(error.statusCode).json({ error: error.message });
      else res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export const bookingsController = new BookingsController();
