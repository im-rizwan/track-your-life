import { prisma } from '../../core/database/prisma.client';
import { CreateUserData, UpdateUserData, PublicUser } from './types/user.types';
import { User } from '@prisma/client';

export class UsersRepository {
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
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
