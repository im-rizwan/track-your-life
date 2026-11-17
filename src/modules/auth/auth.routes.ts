import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../core/middleware/validator';
import { authenticate } from '../../core/middleware/auth.middleware';
import { registerSchema } from './dto/register.dto';
import { loginSchema } from './dto/login.dto';
import { refreshTokenSchema } from './dto/refresh-token.dto';
import { verifyEmailSchema } from './dto/verify-email.dto';
import { resendOtpSchema } from './dto/resend-otp.dto';
import { forgotPasswordSchema } from './dto/forgot-password.dto';
import { resetPasswordSchema } from './dto/reset-password.dto';
import { deleteAccountInitiateSchema } from './dto/delete-account-initiate.dto';
import { deleteAccountConfirmSchema } from './dto/delete-account-confirm.dto';

const router = Router();
const controller = new AuthController();

/**
 * @openapi
 * /v1/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new user account and send email verification OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123
 *     responses:
 *       201:
 *         description: User registered successfully, verification email sent
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
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     message:
 *                       type: string
 *                       example: Registration successful. Please check your email for verification code.
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *       409:
 *         description: User already exists
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
router.post('/register', validate(registerSchema), controller.register);

/**
 * @openapi
 * /v1/auth/verify-email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify email with OTP
 *     description: Verify user's email address using the OTP sent during registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *       409:
 *         description: Email already verified
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
router.post('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);

/**
 * @openapi
 * /v1/auth/resend-verification:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend email verification OTP
 *     description: Send a new verification OTP to the user's email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
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
 *                       example: If the email exists and is not verified, a new verification code has been sent.
 *                 message:
 *                   type: string
 *                   example: Verification code sent
 *       409:
 *         description: Email already verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/resend-verification', validate(resendOtpSchema), controller.resendVerificationOtp);

/**
 * @openapi
 * /v1/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Authenticate user and return tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *                 message:
 *                   type: string
 *                   example: Login successful
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validate(loginSchema), controller.login);

/**
 * @openapi
 * /v1/auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Initiate password reset
 *     description: Send password reset OTP to user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset code sent
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
 *                       example: If the email exists, a password reset code has been sent.
 */
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);

/**
 * @openapi
 * /v1/auth/resend-reset-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend password reset OTP
 *     description: Send a new password reset OTP to the user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset code sent
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
 *                       example: If the email exists, a new password reset code has been sent.
 */
router.post('/resend-reset-otp', validate(resendOtpSchema), controller.resendResetOtp);

/**
 * @openapi
 * /v1/auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset password
 *     description: Reset user password with verified OTP and invalidate all sessions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewSecurePass123
 *     responses:
 *       200:
 *         description: Password reset successful
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
 *                       example: Password reset successful. Please log in with your new password.
 *       422:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);

/**
 * @openapi
 * /v1/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: Use a valid refresh token to obtain new access and refresh tokens. The old refresh token is invalidated (token rotation).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
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
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     refreshToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh', validate(refreshTokenSchema), controller.refreshToken);

/**
 * @openapi
 * /v1/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: Invalidate the provided refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/logout', validate(refreshTokenSchema), controller.logout);

/**
 * @openapi
 * /v1/auth/logout-all:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout from all devices
 *     description: Invalidate all refresh tokens for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout-all', authenticate, controller.logoutAll);

/**
 * @openapi
 * /v1/auth/session:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current session
 *     description: Validate current session token and return user authentication status
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Session valid, user profile retrieved
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
 *         description: Unauthorized - invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/session', authenticate, controller.me);

/**
 * @openapi
 * /v1/auth/delete-account/initiate:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Initiate account deletion
 *     description: Verify password and send OTP to confirm account deletion
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmation
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: CurrentPassword123
 *               confirmation:
 *                 type: string
 *                 example: DELETE
 *                 description: Must be exactly "DELETE" (case-sensitive)
 *     responses:
 *       200:
 *         description: Account deletion initiated
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
 *                       example: Account deletion OTP sent to your email. Please verify to complete deletion.
 *       401:
 *         description: Unauthorized or invalid password
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
router.post(
  '/delete-account/initiate',
  authenticate,
  validate(deleteAccountInitiateSchema),
  controller.deleteAccountInitiate
);

/**
 * @openapi
 * /v1/auth/delete-account/confirm:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Confirm account deletion
 *     description: Verify OTP and permanently delete user account with all data
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
 *         description: Account deleted successfully
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
 *                       example: Account deleted successfully.
 *       401:
 *         description: Unauthorized
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
router.post(
  '/delete-account/confirm',
  authenticate,
  validate(deleteAccountConfirmSchema),
  controller.deleteAccountConfirm
);

export default router;
