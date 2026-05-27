import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { CustomError } from '../errors/custom.error';

export class AuthController {
  register = async (req: Request<object, object, RegisterInput>, res: Response): Promise<void> => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  login = async (req: Request<object, object, LoginInput>, res: Response): Promise<void> => {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ user: req.user });
  };
}

export const authController = new AuthController();
