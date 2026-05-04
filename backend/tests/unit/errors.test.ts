import { describe, it, expect } from 'vitest';
import {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError,
    TooManyRequestsError,
    InternalServerError,
} from '../../src/utils/errors';

describe('Error Classes', () => {
    describe('AppError', () => {
        it('should create an error with status code and message', () => {
            const err = new AppError(500, 'Something broke');
            expect(err.statusCode).toBe(500);
            expect(err.message).toBe('Something broke');
            expect(err.name).toBe('AppError');
            expect(err instanceof Error).toBe(true);
        });

        it('should support optional code and details', () => {
            const err = new AppError(400, 'Invalid', 'CUSTOM_CODE', { field: 'name' });
            expect(err.code).toBe('CUSTOM_CODE');
            expect(err.details).toEqual({ field: 'name' });
        });
    });

    describe('BadRequestError', () => {
        it('should default to 400 status', () => {
            const err = new BadRequestError();
            expect(err.statusCode).toBe(400);
            expect(err.message).toBe('Bad request');
            expect(err.code).toBe('BAD_REQUEST');
            expect(err.name).toBe('BadRequestError');
        });

        it('should accept custom message and details', () => {
            const err = new BadRequestError('Invalid email', 'INVALID_EMAIL', { email: 'bad' });
            expect(err.message).toBe('Invalid email');
            expect(err.code).toBe('INVALID_EMAIL');
            expect(err.details).toEqual({ email: 'bad' });
        });
    });

    describe('UnauthorizedError', () => {
        it('should default to 401 status', () => {
            const err = new UnauthorizedError();
            expect(err.statusCode).toBe(401);
            expect(err.code).toBe('UNAUTHORIZED');
            expect(err.name).toBe('UnauthorizedError');
        });
    });

    describe('ForbiddenError', () => {
        it('should default to 403 status', () => {
            const err = new ForbiddenError();
            expect(err.statusCode).toBe(403);
            expect(err.code).toBe('FORBIDDEN');
            expect(err.name).toBe('ForbiddenError');
        });
    });

    describe('NotFoundError', () => {
        it('should default to 404 status', () => {
            const err = new NotFoundError();
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe('Resource not found');
            expect(err.code).toBe('NOT_FOUND');
            expect(err.name).toBe('NotFoundError');
        });

        it('should accept custom message', () => {
            const err = new NotFoundError('Student not found');
            expect(err.message).toBe('Student not found');
        });
    });

    describe('ConflictError', () => {
        it('should default to 409 status', () => {
            const err = new ConflictError();
            expect(err.statusCode).toBe(409);
            expect(err.code).toBe('CONFLICT');
        });
    });

    describe('ValidationError', () => {
        it('should default to 422 status with details', () => {
            const details = [{ field: 'name', message: 'required' }];
            const err = new ValidationError('Validation failed', details);
            expect(err.statusCode).toBe(422);
            expect(err.code).toBe('VALIDATION_ERROR');
            expect(err.details).toEqual(details);
        });
    });

    describe('TooManyRequestsError', () => {
        it('should default to 429 status', () => {
            const err = new TooManyRequestsError();
            expect(err.statusCode).toBe(429);
            expect(err.code).toBe('TOO_MANY_REQUESTS');
        });
    });

    describe('InternalServerError', () => {
        it('should default to 500 status', () => {
            const err = new InternalServerError();
            expect(err.statusCode).toBe(500);
            expect(err.code).toBe('INTERNAL_ERROR');
        });
    });

    describe('Inheritance chain', () => {
        it('all error subclasses should be instances of AppError', () => {
            expect(new BadRequestError() instanceof AppError).toBe(true);
            expect(new UnauthorizedError() instanceof AppError).toBe(true);
            expect(new ForbiddenError() instanceof AppError).toBe(true);
            expect(new NotFoundError() instanceof AppError).toBe(true);
            expect(new ConflictError() instanceof AppError).toBe(true);
            expect(new ValidationError() instanceof AppError).toBe(true);
            expect(new TooManyRequestsError() instanceof AppError).toBe(true);
            expect(new InternalServerError() instanceof AppError).toBe(true);
        });

        it('all error subclasses should be instances of Error', () => {
            expect(new BadRequestError() instanceof Error).toBe(true);
            expect(new NotFoundError() instanceof Error).toBe(true);
        });
    });
});
