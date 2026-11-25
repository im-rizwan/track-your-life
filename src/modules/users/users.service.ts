import bcrypt from 'bcryptjs';
import { UsersRepository } from './users.repository';
import { CreateUserData, UpdateUserData, PublicUser } from './types/user.types';
import { ConflictError, NotFoundError, ValidationError } from '../../core/errors/app-error';
import { OtpPurpose } from '@prisma/client';
import { emailService, EmailPurpose } from '../../core/services/email.service';
import { config } from '../../core/config/env.config';
import geoTz from 'geo-tz';

export class UsersService {
  private repository: UsersRepository;

  constructor() {
    this.repository = new UsersRepository();
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
  ): Promise<{ id: string; metadata: unknown } | null> {
    if (config.env === 'test') {
      const token = await this.repository.findOtpToken(userId, plainOtp, purpose);
      return token ? { id: token.id, metadata: token.metadata } : null;
    }
    const candidates = await this.repository.findUnusedOtpTokens(userId, purpose);
    for (const candidate of candidates) {
      const matches = await bcrypt.compare(plainOtp, candidate.token);
      if (matches) {
        return { id: candidate.id, metadata: candidate.metadata };
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

  // Profile Management
  async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.repository.excludePassword(user);
  }

  async updateProfile(
    userId: string,
    data: {
      displayName?: string;
      age?: number;
      city?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
    }
  ): Promise<PublicUser> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Prepare update data
    const updateData: UpdateUserData = {
      displayName: data.displayName,
      age: data.age,
      city: data.city,
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    // Derive timezone if both latitude and longitude are provided
    if (data.latitude !== undefined && data.longitude !== undefined) {
      updateData.timezone = this.getTimezoneFromCoordinates(data.latitude, data.longitude);
    }

    const updatedUser = await this.repository.update(userId, updateData);
    return this.repository.excludePassword(updatedUser);
  }

  /**
   * Get timezone from coordinates using geo-tz library
   */
  private getTimezoneFromCoordinates(latitude: number, longitude: number): string {
    try {
      const timezones = geoTz.find(latitude, longitude);
      return timezones[0] || 'UTC';
    } catch (error) {
      console.error('Failed to derive timezone from coordinates:', {
        error: error instanceof Error ? error.message : error,
        latitude,
        longitude,
      });
      return 'UTC'; // Fallback to UTC
    }
  }

  // Onboarding
  async completeOnboarding(
    userId: string,
    data: {
      displayName: string;
      age: number;
      city: string;
      country: string;
      latitude?: number;
      longitude?: number;
    }
  ): Promise<PublicUser> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isOnboarded) {
      throw new ConflictError('User has already completed onboarding');
    }

    const updateData: UpdateUserData = {
      displayName: data.displayName,
      age: data.age,
      city: data.city,
      country: data.country,
      isOnboarded: true,
    };

    // Store location and derive timezone if provided
    if (data.latitude !== undefined && data.longitude !== undefined) {
      updateData.latitude = data.latitude;
      updateData.longitude = data.longitude;
      updateData.timezone = this.getTimezoneFromCoordinates(data.latitude, data.longitude);
    }

    const updatedUser = await this.repository.update(userId, updateData);

    return this.repository.excludePassword(updatedUser);
  }

  async getOnboardingStatus(userId: string): Promise<{ isOnboarded: boolean }> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return { isOnboarded: user.isOnboarded };
  }

  // Email Change
  async requestEmailChange(userId: string, newEmail: string): Promise<{ message: string }> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if new email is already in use
    const emailExists = await this.repository.findByEmail(newEmail);
    if (emailExists) {
      throw new ConflictError('Email already in use');
    }

    // Generate OTP
    const otp = this.generateOtp();
    const hashedOtp = await this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Use transaction for DB atomicity, send email after commit
    await this.repository.transaction(
      async (tx) => {
        // Invalidate existing unused EMAIL_CHANGE OTPs
        await tx.otpToken.updateMany({
          where: {
            userId,
            purpose: OtpPurpose.EMAIL_CHANGE,
            isUsed: false,
          },
          data: {
            isUsed: true,
            usedAt: new Date(),
          },
        });

        // Store hashed OTP with new email in metadata
        await tx.otpToken.create({
          data: {
            userId,
            token: hashedOtp,
            purpose: OtpPurpose.EMAIL_CHANGE,
            expiresAt,
            metadata: { newEmail },
          },
        });
      },
    );

    // Send OTP to NEW email address after transaction commits
    await this.sendOtpEmail(newEmail, otp, EmailPurpose.EMAIL_CHANGE);

    return {
      message: 'Verification code sent to new email address.',
    };
  }

  async confirmEmailChange(userId: string, otp: string): Promise<{ message: string }> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Find and verify OTP (bcrypt comparison)
    const otpMatch = await this.findMatchingOtp(userId, otp, OtpPurpose.EMAIL_CHANGE);

    if (!otpMatch || !otpMatch.metadata) {
      throw new ValidationError('Invalid or expired OTP');
    }

    // Extract new email from metadata
    const metadata = otpMatch.metadata as { newEmail: string };
    const newEmail = metadata.newEmail;

    if (!newEmail) {
      throw new ValidationError('Invalid OTP metadata');
    }

    // Double-check email is not in use (race condition prevention)
    const emailExists = await this.repository.findByEmail(newEmail);
    if (emailExists) {
      throw new ConflictError('Email already in use');
    }

    // Atomically claim the OTP — if a concurrent request already won this
    // race, treat it the same as an invalid OTP rather than proceeding.
    const claimed = await this.repository.claimOtp(otpMatch.id);
    if (!claimed) {
      throw new ValidationError('Invalid or expired OTP');
    }

    // Update user email
    await this.repository.update(userId, {
      email: newEmail,
      isEmailVerified: true, // New email is verified
    });

    return {
      message: 'Email updated successfully.',
    };
  }
}
