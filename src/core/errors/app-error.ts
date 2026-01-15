export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
    public code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', code?: string) {
    super(400, message, true, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code?: string) {
    super(401, message, true, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code?: string) {
    super(403, message, true, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code?: string) {
    super(404, message, true, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', code?: string) {
    super(409, message, true, code);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', code?: string) {
    super(422, message, true, code);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', code?: string) {
    super(500, message, false, code);
  }
}
