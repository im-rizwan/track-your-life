import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../errors/app-error';

export const validate = (schema: z.ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as { body?: unknown; query?: unknown; params?: unknown };

      // Apply Zod transforms (trim, toLowerCase, etc.) back to request body
      // Note: req.query and req.params are read-only getters in Express 5,
      // so we only apply transforms to req.body where it matters most
      // (email normalization, string trimming, etc.)
      if (parsed.body) req.body = parsed.body;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));

        next(new ValidationError(errorMessages.map((e) => e.message).join('; ')));
        return;
      }
      next(error);
    }
  };
};
