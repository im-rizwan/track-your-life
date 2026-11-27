import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../core/config/env.config';
import { UnauthorizedError, ConflictError, ValidationError } from '../../core/errors/app-error';
import {
  TokenPayload,
  AuthTokens,
  AuthResponse,
  DecodedToken,
  JwtSignOptions,
} from './types/auth.types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User, OtpPurpose } from '@prisma/client';
import { AuthRepository } from './auth.repository';
import { emailService, EmailPurpose } from '../../core/services/email.service';

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  // Generate JWT access token
  private generateAccessToken(payload: TokenPayload): string {
    const options: JwtSignOptions = {
      expiresIn: config.jwt.expiresIn,
      algorithm: 'HS256',
    };

    // Same rationale as the refresh token's jti: without it, two access
    // tokens issued for the same user in the same wall-clock second are
    // byte-identical, so "refresh" wouldn't actually produce a new access
    // token when called within a second of the original issuance.
    return jwt.sign({ ...payload, jti: crypto.randomUUID() }, config.jwt.secret, options);
  }

  // Generate JWT refresh token
  private generateRefreshToken(payload: TokenPayload): string {
    const options: JwtSignOptions = {
      expiresIn: config.jwt.refreshExpiresIn,
      algorithm: 'HS256',
    };

    // A random jti guarantees a unique token string even when two refresh
    // tokens are issued for the same user within the same wall-clock second
    // (JWTs are otherwise deterministic from payload + iat, and RefreshToken
    // .token has a @unique constraint — without this, concurrent logins or
    // rapid re-registration/re-verification for one user could collide).
    return jwt.sign({ ...payload, jti: crypto.randomUUID() }, config.jwt.refreshSecret, options);
  }

  // Verify access token
  verifyAccessToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, config.jwt.secret) as DecodedToken;
    } catch {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }

  // Verify refresh token
  private verifyRefreshToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as DecodedToken;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  // Store refresh token in database
  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const decoded = this.verifyRefreshToken(token);
    const expiresAt = new Date(decoded.exp * 1000);

    await this.repository.createRefreshToken({
      token,
      userId,
      expiresAt,
    });
  }

  // Remove password from user object
  private excludePassword(user: User): Omit<User, 'password'> {
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Generate 6-digit OTP
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Hash OTP before storage (skipped in test mode for DB-readable OTPs)
  private async hashOtp(otp: string): Promise<string> {
    if (config.env === 'test') return otp;
    return bcrypt.hash(otp, 10);
  }

  // Find and verify OTP (bcrypt comparison in production, plaintext in test)
  private async findMatchingOtp(
    userId: string,
    plainOtp: string,
    purpose: OtpPurpose
  ): Promise<{ id: string } | null> {
    if (config.env === 'test') {
      // In test mode OTPs are stored as plaintext
      const token = await this.repository.findOtpToken(userId, plainOtp, purpose);
      return token ? { id: token.id } : null;
    }
    const candidates = await this.repository.findUnusedOtpTokens(userId, purpose);
    for (const candidate of candidates) {
      const matches = await bcrypt.compare(plainOtp, candidate.token);
      if (matches) {
        return { id: candidate.id };
      }
    }
    return null;
  }

  // Send OTP via email using EmailJS
  private async sendOtpEmail(email: string, otp: string, purpose: EmailPurpose): Promise<void> {
    await emailService.sendOtpEmail({
      to: email,
      otp,
      purpose,
    });
  }

  // Register new user
  async register(data: RegisterDto): Promise<{ email: string; message: string }> {
    // Check if user already exists
    const existingUser = await this.repository.findUserByEmail(data.email);

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Generate OTP before transaction
    const otp = this.generateOtp();
    const hashedOtp = await this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Use transaction for DB atomicity, send email after commit
    const result = await this.repository.transaction(async (tx) => {
      // Create user with unverified email
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
        },
      });

      // Store hashed OTP
      await tx.otpToken.create({
        data: {
          userId: user.id,
          token: hashedOtp,
          purpose: OtpPurpose.EMAIL_VERIFICATION,
          expiresAt,
        },
      });

      return {
        email: user.email,
        message: 'Registration successful. Please check your email for verification code.',
      };
    });

    // Send OTP email after transaction commits (non-blocking for DB)
    await this.sendOtpEmail(data.email, otp, EmailPurpose.EMAIL_VERIFICATION);

    return result;
  }

  // Verify email with OTP
  async verifyEmail(email: string, otp: string): Promise<AuthResponse> {
    // Find user by email
    const user = await this.repository.findUserByEmail(email);

    if (!user) {
      throw new ValidationError('Invalid email or OTP');
    }

    // Check if already verified
    if (user.isEmailVerified) {
      throw new ConflictError('Email already verified');
    }

    // Find and verify OTP (bcrypt comparison)
    const otpMatch = await this.findMatchingOtp(user.id, otp, OtpPurpose.EMAIL_VERIFICATION);

    if (!otpMatch) {
      throw new ValidationError('Invalid or expired OTP');
    }

    // Atomically claim the OTP — if a concurrent request already won this
    // race, treat it the same as an invalid OTP rather than proceeding.
    const claimed = await this.repository.claimOtp(otpMatch.id);
    if (!claimed) {
      throw new ValidationError('Invalid or expired OTP');
    }

    // Update user email verification status
    const updatedUser = await this.repository.updateUser(user.id, {
      isEmailVerified: true,
    });

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: updatedUser.id,
      email: updatedUser.email,
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    // Store refresh token
    await this.storeRefreshToken(updatedUser.id, refreshToken);

    return {
      user: this.excludePassword(updatedUser),
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  // Resend verification OTP
  async resendVerificationOtp(email: string): Promise<{ message: string }> {
    // Find user by email
    const user = await this.repository.findUserByEmail(email);

    if (!user) {
      // Silently succeed for security (don't reveal if email exists)
      return {
        message: 'If the email exists and is not verified, a new verification code has been sent.',
      };
    }

    // Check if already verified
    if (user.isEmailVerified) {
      throw new ConflictError('Email already verified');
    }

    // Generate new OTP
    const otp = this.generateOtp();
    const hashedOtp = await this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Use transaction for DB atomicity, send email after commit
    await this.repository.transaction(async (tx) => {
      // Invalidate existing unused EMAIL_VERIFICATION OTPs
      await tx.otpToken.updateMany({
        where: {
          userId: user.id,
          purpose: OtpPurpose.EMAIL_VERIFICATION,
          isUsed: false,
        },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      // Store hashed OTP
      await tx.otpToken.create({
        data: {
          userId: user.id,
          token: hashedOtp,
          purpose: OtpPurpose.EMAIL_VERIFICATION,
          expiresAt,
        },
      });
    });

    // Send OTP email after transaction commits
    await this.sendOtpEmail(email, otp, EmailPurpose.EMAIL_VERIFICATION);

    return {
      message: 'If the email exists and is not verified, a new verification code has been sent.',
    };
  }

  // Initiate password reset
  async initiatePasswordReset(email: string): Promise<{ message: string }> {
    // Find user by email
    const user = await this.repository.findUserByEmail(email);

    // Silently succeed even if user not found (security best practice)
    if (!user) {
      return {
        message: 'If the email exists, a password reset code has been sent.',
      };
    }

    // Generate OTP
    const otp = this.generateOtp();
    const hashedOtp = await this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Use transaction for DB atomicity, send email after commit
    await this.repository.transaction(async (tx) => {
      // Invalidate existing unused PASSWORD_RESET OTPs
      await tx.otpToken.updateMany({
        where: {
          userId: user.id,
          purpose: OtpPurpose.PASSWORD_RESET,
          isUsed: false,
        },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      // Store hashed OTP
      await tx.otpToken.create({
        data: {
          userId: user.id,
          token: hashedOtp,
          purpose: OtpPurpose.PASSWORD_RESET,
          expiresAt,
        },
      });
    });

    // Send OTP email after transaction commits
    await this.sendOtpEmail(email, otp, EmailPurpose.PASSWORD_RESET);

    return {
      message: 'If the email exists, a password reset code has been sent.',
    };
  }

  // Resend password reset OTP
  async resendResetOtp(email: string): Promise<{ message: string }> {
    // Find user by email
    const user = await this.repository.findUserByEmail(email);

    // Silently succeed even if user not found
    if (!user) {
      return {
        message: 'If the email exists, a new password reset code has been sent.',
      };
    }

    // Generate new OTP
    const otp = this.generateOtp();
    const hashedOtp = await this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Use transaction for DB atomicity, send email after commit
    await this.repository.transaction(async (tx) => {
      // Invalidate existing unused PASSWORD_RESET OTPs
      await tx.otpToken.updateMany({
        where: {
          userId: user.id,
          purpose: OtpPurpose.PASSWORD_RESET,
          isUsed: false,
        },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      // Store hashed OTP
      await tx.otpToken.create({
        data: {
          userId: user.id,
          token: hashedOtp,
          purpose: OtpPurpose.PASSWORD_RESET,
          expiresAt,
        },
      });
    });

    // Send OTP email after transaction commits
    await this.sendOtpEmail(email, otp, EmailPurpose.PASSWORD_RESET);

    return {
      message: 'If the email exists, a new password reset code has been sent.',
    };
  }

  // Reset password with OTP
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ message: string }> {
    // Find user by email
    const user = await this.repository.findUserByEmail(email);

    if (!user) {
      throw new ValidationError('Invalid email or OTP');
    }

    // Find and verify OTP (bcrypt comparison)
    const otpMatch = await this.findMatchingOtp(user.id, otp, OtpPurpose.PASSWORD_RESET);

    if (!otpMatch) {
      throw new ValidationError('Invalid or expired OTP');
    }

    // Atomically claim the OTP — if a concurrent request already won this
    // race, treat it the same as an invalid OTP rather than proceeding.
    const claimed = await this.repository.claimOtp(otpMatch.id);
    if (!claimed) {
      throw new ValidationError('Invalid or expired OTP');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await this.repository.updateUser(user.id, {
      password: hashedPassword,
    });

    // Delete all refresh tokens (invalidate all sessions)
    await this.repository.deleteUserRefreshTokens(user.id);

    return {
      message: 'Password reset successful. Please log in with your new password.',
    };
  }

  // Initiate account deletion
  async initiateAccountDeletion(
    userId: string,
    password: string,
    confirmation: string
  ): Promise<{ message: string }> {
    // Get user
    const user = await this.repository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid password');
    }

    // Verify confirmation (already validated by Zod, but double-check)
    if (confirmation !== 'DELETE') {
      throw new ValidationError('Confirmation must be exactly "DELETE"');
    }

    // Generate OTP
    const otp = this.generateOtp();
    const hashedOtp = await this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Use transaction for DB atomicity, send email after commit
    await this.repository.transaction(async (tx) => {
      // Invalidate existing unused ACCOUNT_DELETION OTPs
      await tx.otpToken.updateMany({
        where: {
          userId,
          purpose: OtpPurpose.ACCOUNT_DELETION,
          isUsed: false,
        },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      // Store hashed OTP
      await tx.otpToken.create({
        data: {
          userId,
          token: hashedOtp,
          purpose: OtpPurpose.ACCOUNT_DELETION,
          expiresAt,
        },
      });
    });

    // Send OTP email after transaction commits
    await this.sendOtpEmail(user.email, otp, EmailPurpose.ACCOUNT_DELETION);

    return {
      message: 'Account deletion OTP sent to your email. Please verify to complete deletion.',
    };
  }

  // Confirm account deletion
  async confirmAccountDeletion(userId: string, otp: string): Promise<{ message: string }> {
    // Get user
    const user = await this.repository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Find and verify OTP (bcrypt comparison)
    const otpMatch = await this.findMatchingOtp(userId, otp, OtpPurpose.ACCOUNT_DELETION);

    if (!otpMatch) {
      throw new ValidationError('Invalid or expired OTP');
    }

    // Atomically claim the OTP — if a concurrent request already won this
    // race, treat it the same as an invalid OTP rather than proceeding.
    const claimed = await this.repository.claimOtp(otpMatch.id);
    if (!claimed) {
      throw new ValidationError('Invalid or expired OTP');
    }

    // Delete user (cascade will handle all related data)
    await this.repository.deleteUser(userId);

    // Send confirmation email
    await emailService.sendAccountDeletedConfirmation(user.email);

    return {
      message: 'Account deleted successfully.',
    };
  }

  // Login user
  async login(data: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    // Find user by email
    const user = await this.repository.findUserByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedError('Please verify your email first');
    }

    // Check for account lockout (5 failed attempts in last 15 minutes)
    const recentFailedAttempts = await this.repository.countRecentFailedAttempts(user.id, 15);
    if (recentFailedAttempts >= 5) {
      throw new UnauthorizedError('Too many failed login attempts. Account locked for 15 minutes.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      // Record failed login attempt
      await this.repository.recordFailedLogin({
        userId: user.id,
        ipAddress,
        userAgent,
      });

      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await this.repository.updateLastLogin(user.id);

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);

    return {
      user: this.excludePassword(user),
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token
    const decoded = this.verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const storedToken = await this.repository.findRefreshTokenWithUser(refreshToken);

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await this.repository.deleteRefreshToken(refreshToken);
      throw new UnauthorizedError('Refresh token expired');
    }

    // Check if user is active
    if (!storedToken.user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      userId: decoded.userId,
      email: decoded.email,
    };

    const newAccessToken = this.generateAccessToken(tokenPayload);
    const newRefreshToken = this.generateRefreshToken(tokenPayload);

    // Delete old refresh token and store new one
    await this.repository.deleteRefreshToken(refreshToken);
    await this.storeRefreshToken(decoded.userId, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // Logout user (invalidate refresh token)
  async logout(refreshToken: string): Promise<void> {
    await this.repository.deleteRefreshToken(refreshToken);
  }

  // Logout from all devices (invalidate all refresh tokens)
  async logoutAll(userId: string): Promise<void> {
    await this.repository.deleteUserRefreshTokens(userId);
  }

  // Get user by ID (for auth middleware)
  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.repository.findUserById(userId);

    if (!user) {
      return null;
    }

    return this.excludePassword(user);
  }
}
