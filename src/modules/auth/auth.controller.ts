import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../core/utils/async-handler';
import { sendSuccess, sendCreated } from '../../core/utils/response';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { DeleteAccountInitiateDto } from './dto/delete-account-initiate.dto';
import { DeleteAccountConfirmDto } from './dto/delete-account-confirm.dto';

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

  verifyEmail = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, otp } = req.body as VerifyEmailDto;
    const result = await this.service.verifyEmail(email, otp);
    sendSuccess(res, result, 'Email verified successfully');
  });

  resendVerificationOtp = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body as ResendOtpDto;
    const result = await this.service.resendVerificationOtp(email);
    sendSuccess(res, result, 'Verification code sent');
  });

  login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = req.body as LoginDto;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    const result = await this.service.login(data, ipAddress, userAgent);
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

  forgotPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body as ForgotPasswordDto;
    const result = await this.service.initiatePasswordReset(email);
    sendSuccess(res, result, 'Password reset code sent');
  });

  resendResetOtp = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body as ResendOtpDto;
    const result = await this.service.resendResetOtp(email);
    sendSuccess(res, result, 'Password reset code sent');
  });

  resetPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, otp, newPassword } = req.body as ResetPasswordDto;
    const result = await this.service.resetPassword(email, otp, newPassword);
    sendSuccess(res, result, 'Password reset successful');
  });

  deleteAccountInitiate = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const { password, confirmation } = req.body as DeleteAccountInitiateDto;
    const result = await this.service.initiateAccountDeletion(userId, password, confirmation);
    sendSuccess(res, result, 'Account deletion initiated');
  });

  deleteAccountConfirm = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const { otp } = req.body as DeleteAccountConfirmDto;
    const result = await this.service.confirmAccountDeletion(userId, otp);
    sendSuccess(res, result, 'Account deleted successfully');
  });
}
