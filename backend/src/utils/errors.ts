export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code?: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class BadRequestError extends AppError {
    constructor(message = 'Bad request', code?: string, details?: unknown) {
        super(400, message, code || 'BAD_REQUEST', details);
        this.name = 'BadRequestError';
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', code?: string) {
        super(401, message, code || 'UNAUTHORIZED');
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', code?: string) {
        super(403, message, code || 'FORBIDDEN');
        this.name = 'ForbiddenError';
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found', code?: string) {
        super(404, message, code || 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Conflict', code?: string) {
        super(409, message, code || 'CONFLICT');
        this.name = 'ConflictError';
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Validation failed', details?: unknown) {
        super(422, message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

export class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests', code?: string) {
        super(429, message, code || 'TOO_MANY_REQUESTS');
        this.name = 'TooManyRequestsError';
    }
}

export class InternalServerError extends AppError {
    constructor(message = 'Internal server error', code?: string) {
        super(500, message, code || 'INTERNAL_ERROR');
        this.name = 'InternalServerError';
    }
}
