import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { sendSuccess, sendCreated } from '../../core/utils/response';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { OnboardingDto } from './dto/onboarding.dto';
import { EmailChangeRequestDto } from './dto/email-change-request.dto';
import { EmailChangeConfirmDto } from './dto/email-change-confirm.dto';

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

  // Profile Management
  getProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const profile = await this.service.getProfile(userId);
    sendSuccess(res, profile);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const data = req.body as UpdateProfileDto;
    const profile = await this.service.updateProfile(userId, data);
    sendSuccess(res, profile, 'Profile updated successfully');
  });

  // Onboarding
  completeOnboarding = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const data = req.body as OnboardingDto;
    const profile = await this.service.completeOnboarding(userId, data);
    sendSuccess(res, profile, 'Onboarding completed successfully');
  });

  getOnboardingStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const status = await this.service.getOnboardingStatus(userId);
    sendSuccess(res, status);
  });

  // Email Change
  requestEmailChange = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const { newEmail } = req.body as EmailChangeRequestDto;
    const result = await this.service.requestEmailChange(userId, newEmail);
    sendSuccess(res, result, 'Verification code sent');
  });

  confirmEmailChange = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const { otp } = req.body as EmailChangeConfirmDto;
    const result = await this.service.confirmEmailChange(userId, otp);
    sendSuccess(res, result, 'Email updated successfully');
  });
}
