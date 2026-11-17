import { prisma } from '../../core/database/prisma.client';
import { User, RefreshToken, OtpToken, OtpPurpose, Prisma } from '@prisma/client';

export class AuthRepository {
  // Transaction support for atomic operations
  async transaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: {
      timeout?: number;
      maxWait?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    }
  ): Promise<T> {
    return prisma.$transaction(fn, options);
  }
  // User queries
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: { email: string; password: string }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        isEmailVerified: false,
      },
    });
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  // Refresh token queries
  async createRefreshToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data,
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({
      where: { token },
    });
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async deleteExpiredRefreshTokens(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
  async updateLastLogin(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async findRefreshTokenWithUser(token: string): Promise<(RefreshToken & { user: User }) | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  // OTP Token queries
  async createOtpToken(data: {
    userId: string;
    token: string;
    purpose: OtpPurpose;
    expiresAt: Date;
    metadata?: Prisma.InputJsonValue;
  }): Promise<OtpToken> {
    return prisma.otpToken.create({
      data,
    });
  }

  async findOtpToken(userId: string, token: string, purpose: OtpPurpose): Promise<OtpToken | null> {
    return prisma.otpToken.findFirst({
      where: {
        userId,
        token,
        purpose,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async findUnusedOtpTokens(userId: string, purpose: OtpPurpose): Promise<OtpToken[]> {
    return prisma.otpToken.findMany({
      where: {
        userId,
        purpose,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOtpByEmail(
    email: string,
    token: string,
    purpose: OtpPurpose
  ): Promise<OtpToken | null> {
    const user = await this.findUserByEmail(email);
    if (!user) return null;

    return this.findOtpToken(user.id, token, purpose);
  }

  async markOtpUsed(otpId: string): Promise<OtpToken> {
    return prisma.otpToken.update({
      where: { id: otpId },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });
  }

  async invalidateUnusedOtps(userId: string, purpose: OtpPurpose): Promise<void> {
    await prisma.otpToken.updateMany({
      where: {
        userId,
        purpose,
        isUsed: false,
      },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });
  }

  // Failed Login Attempt queries
  async recordFailedLogin(data: {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await prisma.failedLoginAttempt.create({
      data,
    });
  }

  async countRecentFailedAttempts(userId: string, minutesAgo: number): Promise<number> {
    const since = new Date(Date.now() - minutesAgo * 60 * 1000);

    return prisma.failedLoginAttempt.count({
      where: {
        userId,
        attemptedAt: {
          gte: since,
        },
      },
    });
  }

  async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }
}
