import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { sendSuccess, sendCreated } from '../../core/utils/response';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export class UsersController {
  private service: UsersService;

  constructor() {
    this.service = new UsersService();
  }

  createUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = req.body as CreateUserDto;
    const user = await this.service.createUser(data);
    sendCreated(res, user, 'User created successfully');
  });

  getUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = req.params.id as string;
    const user = await this.service.getUserById(id);
    sendSuccess(res, user);
  });

  getAllUsers = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await this.service.getAllUsers(page, limit);
    sendSuccess(res, result);
  });

  updateUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = req.params.id as string;
    const data = req.body as UpdateUserDto;
    
    const user = await this.service.updateUser(id, data);
    sendSuccess(res, user, 'User updated successfully');
  });

  deleteUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = req.params.id as string;
    await this.service.deleteUser(id);
    sendSuccess(res, null, 'User deleted successfully');
  });
}
