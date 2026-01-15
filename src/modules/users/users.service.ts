import bcrypt from 'bcryptjs';
import { UsersRepository } from './users.repository';
import { CreateUserData, UpdateUserData, PublicUser } from './types/user.types';
import { ConflictError, NotFoundError } from '../../core/errors/app-error';

export class UsersService {
  private repository: UsersRepository;

  constructor() {
    this.repository = new UsersRepository();
  }

  async createUser(data: CreateUserData): Promise<PublicUser> {
    // Check if user already exists
    const existingUser = await this.repository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await this.repository.create({
      ...data,
      password: hashedPassword,
    });

    return this.repository.excludePassword(user);
  }

  async getUserById(id: string): Promise<PublicUser> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.repository.excludePassword(user);
  }

  async getUserByEmail(email: string): Promise<PublicUser> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.repository.excludePassword(user);
  }

  async getAllUsers(
    page = 1,
    limit = 10
  ): Promise<{ users: PublicUser[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.repository.findAll(skip, limit),
      this.repository.count(),
    ]);

    return {
      users: users.map((user) => this.repository.excludePassword(user)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUser(id: string, data: UpdateUserData): Promise<PublicUser> {
    // Check if user exists
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // If email is being updated, check for conflicts
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.repository.findByEmail(data.email);
      if (emailExists) {
        throw new ConflictError('Email already in use');
      }
    }

    const updatedUser = await this.repository.update(id, data);
    return this.repository.excludePassword(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.repository.delete(id);
  }
}
