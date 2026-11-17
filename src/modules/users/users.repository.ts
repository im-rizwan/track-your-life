import { prisma } from '../../core/database/prisma.client';
import { CreateUserData, UpdateUserData, PublicUser } from './types/user.types';
import { User, OtpToken, OtpPurpose, Prisma } from '@prisma/client';

export class UsersRepository {
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
  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findAll(skip = 0, take = 10): Promise<User[]> {
    return prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return prisma.user.count();
  }

  // Remove password from user object
  excludePassword(user: User): PublicUser {
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // OTP Token operations for email change
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
}
