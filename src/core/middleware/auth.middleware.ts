import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/app-error';
import { AuthService } from '../../modules/auth/auth.service';

const authService = new AuthService();

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = authService.verifyAccessToken(token);

    // Get user from database
    const user = await authService.getUserById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // login() already blocks deactivated accounts, but a token issued before
    // deactivation would otherwise keep working here until it expires. No
    // code path currently sets isActive=false (account deletion is a hard
    // delete), so this is dormant today — but worth having correct before
    // any future deactivation feature silently inherits the gap.
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

// Optional: Middleware for optional authentication (doesn't fail if no token)
// export const optionalAuthenticate = async (
//   req: Request,
//   _res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       const token = authHeader.substring(7);
//       const decoded = authService.verifyAccessToken(token);
//       const user = await authService.getUserById(decoded.userId);
//       if (user) {
//         req.user = user;
//       }
//     }

//     next();
//   } catch (error) {
//     // Ignore authentication errors for optional auth
//     next();
//   }
// };
