import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../core/config/env.config';
import { UnauthorizedError, ConflictError } from '../../core/errors/app-error';
import {
  TokenPayload,
  AuthTokens,
  AuthResponse,
  DecodedToken,
  JwtSignOptions,
} from './types/auth.types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import { AuthRepository } from './auth.repository';

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

    return jwt.sign(payload, config.jwt.secret, options);
  }

  // Generate JWT refresh token
  private generateRefreshToken(payload: TokenPayload): string {
    const options: JwtSignOptions = {
      expiresIn: config.jwt.refreshExpiresIn,
      algorithm: 'HS256',
    };

    return jwt.sign(payload, config.jwt.refreshSecret, options);
  }

  // Verify access token
  verifyAccessToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, config.jwt.secret) as DecodedToken;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }

  // Verify refresh token
  private verifyRefreshToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as DecodedToken;
    } catch (error) {
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
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Register new user
  async register(data: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.repository.findUserByEmail(data.email);

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await this.repository.createUser({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });

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

  // Login user
  async login(data: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.repository.findUserByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
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
