import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { sendSuccess, sendCreated } from '../../core/utils/response';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = req.body as RegisterDto;
    const result = await this.service.register(data);
    sendCreated(res, result, 'User registered successfully');
  });

  login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = req.body as LoginDto;
    const result = await this.service.login(data);
    sendSuccess(res, result, 'Login successful');
  });

  refreshToken = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body as RefreshTokenDto;
    const tokens = await this.service.refreshAccessToken(refreshToken);
    sendSuccess(res, tokens, 'Token refreshed successfully');
  });

  logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body as RefreshTokenDto;
    await this.service.logout(refreshToken);
    sendSuccess(res, null, 'Logout successful');
  });

  logoutAll = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    await this.service.logoutAll(userId);
    sendSuccess(res, null, 'Logged out from all devices');
  });

  me = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    sendSuccess(res, req.user, 'User profile retrieved');
  });
}
