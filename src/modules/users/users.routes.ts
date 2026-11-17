import { Router } from 'express';
import { UsersController } from './users.controller';
import { validate } from '../../core/middleware/validator';
import { authenticate } from '../../core/middleware/auth.middleware';
import { updateProfileSchema } from './dto/update-profile.dto';
import { onboardingSchema } from './dto/onboarding.dto';
import { emailChangeRequestSchema } from './dto/email-change-request.dto';
import { emailChangeConfirmSchema } from './dto/email-change-confirm.dto';
// Admin DTOs - preserved for future admin module
// import { createUserSchema } from './dto/create-user.dto';
// import { updateUserSchema } from './dto/update-user.dto';

const router = Router();
const controller = new UsersController();

// Protected routes (require authentication)
router.use(authenticate);

// ============================================================================
// USER PROFILE & ONBOARDING ENDPOINTS (API Spec v2.0)
// ============================================================================

/**
 * @openapi
 * /v1/users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', controller.getProfile);

/**
 * @openapi
 * /v1/users/profile:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 pattern: '^[a-zA-Z\s-]+$'
 *                 example: John Doe
 *               age:
 *                 type: integer
 *                 minimum: 6
 *                 maximum: 120
 *                 example: 25
 *               city:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: New York
 *               country:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: United States
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *                 example: 40.7128
 *                 description: User's latitude for prayer times
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *                 example: -74.0060
 *                 description: User's longitude for prayer times
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/profile', validate(updateProfileSchema), controller.updateProfile);

/**
 * @openapi
 * /v1/users/onboarding:
 *   post:
 *     tags:
 *       - Users
 *     summary: Complete user onboarding
 *     description: Submit required profile information for first-time onboarding
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - displayName
 *               - age
 *               - city
 *               - country
 *             properties:
 *               displayName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 pattern: '^[a-zA-Z\s-]+$'
 *                 example: John Doe
 *               age:
 *                 type: integer
 *                 minimum: 6
 *                 maximum: 120
 *                 example: 25
 *               city:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: New York
 *               country:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: United States
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *                 example: 40.7128
 *                 description: User's latitude (optional, for prayer times)
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *                 example: -74.0060
 *                 description: User's longitude (optional, for prayer times)
 *     responses:
 *       200:
 *         description: Onboarding completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: Onboarding completed successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User has already completed onboarding
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/onboarding', validate(onboardingSchema), controller.completeOnboarding);

/**
 * @openapi
 * /v1/users/onboarding/status:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get onboarding status
 *     description: Check if the user has completed onboarding
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     isOnboarded:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/onboarding/status', controller.getOnboardingStatus);

/**
 * @openapi
 * /v1/users/email/request:
 *   post:
 *     tags:
 *       - Users
 *     summary: Request email change
 *     description: Initiate email change by sending OTP to new email address
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *             properties:
 *               newEmail:
 *                 type: string
 *                 format: email
 *                 example: newemail@example.com
 *     responses:
 *       200:
 *         description: Verification code sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Verification code sent to new email address.
 *                 message:
 *                   type: string
 *                   example: Verification code sent
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/email/request', validate(emailChangeRequestSchema), controller.requestEmailChange);

/**
 * @openapi
 * /v1/users/email/confirm:
 *   post:
 *     tags:
 *       - Users
 *     summary: Confirm email change
 *     description: Verify OTP and update user email address
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Email updated successfully.
 *                 message:
 *                   type: string
 *                   example: Email updated successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/email/confirm', validate(emailChangeConfirmSchema), controller.confirmEmailChange);

// ============================================================================
// ADMIN ENDPOINTS (Commented out - not in approved API spec v2.0)
// Preserved for future admin module implementation
// ============================================================================

// router.post('/', validate(createUserSchema), controller.createUser);
// router.get('/', controller.getAllUsers);
// router.get('/:id', controller.getUser);
// router.patch('/:id', validate(updateUserSchema), controller.updateUser);
// router.delete('/:id', controller.deleteUser);

export default router;
