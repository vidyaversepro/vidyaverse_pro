import { FastifyPluginAsync, FastifyError } from 'fastify';
import fp from 'fastify-plugin';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
    fastify.setErrorHandler((error: FastifyError | AppError, request, reply) => {
        // Log the error
        logger.error({
            err: {
                message: error.message,
                stack: error.stack,
                code: 'code' in error ? String((error as unknown as Record<string, unknown>).code) : undefined,
            },
            req: {
                method: request.method,
                url: request.url,
                ip: request.ip,
            },
        });

        // Handle AppError (our custom errors)
        if (error instanceof AppError) {
            return reply.status(error.statusCode).send({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                },
            });
        }

        // Handle Prisma errors
        if (error.name === 'PrismaClientKnownRequestError') {
            const prismaError = error as Prisma.PrismaClientKnownRequestError;

            // Unique constraint violation
            if (prismaError.code === 'P2002') {
                return reply.status(409).send({
                    success: false,
                    error: {
                        message: 'A record with this value already exists',
                        code: 'DUPLICATE_ENTRY',
                        field: Array.isArray(prismaError.meta?.target) ? String(prismaError.meta.target[0]) : undefined,
                    },
                });
            }

            // Foreign key constraint violation
            if (prismaError.code === 'P2003') {
                return reply.status(400).send({
                    success: false,
                    error: {
                        message: 'Referenced record does not exist',
                        code: 'FOREIGN_KEY_ERROR',
                    },
                });
            }

            // Record not found
            if (prismaError.code === 'P2025') {
                return reply.status(404).send({
                    success: false,
                    error: {
                        message: 'Record not found',
                        code: 'NOT_FOUND',
                    },
                });
            }
        }

        // Handle Zod validation errors
        if (error.name === 'ZodError') {
            return reply.status(422).send({
                success: false,
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details: (error as unknown as ZodError).issues,
                },
            });
        }

        // Handle JWT errors
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return reply.status(401).send({
                success: false,
                error: {
                    message: 'Invalid or expired token',
                    code: 'INVALID_TOKEN',
                },
            });
        }

        // Default 500 error
        const statusCode = error.statusCode || 500;
        return reply.status(statusCode).send({
            success: false,
            error: {
                message: statusCode === 500 ? 'Internal server error' : error.message,
                code: 'INTERNAL_ERROR',
            },
        });
    });

    // 404 handler
    fastify.setNotFoundHandler((request, reply) => {
        reply.status(404).send({
            success: false,
            error: {
                message: `Route ${request.method} ${request.url} not found`,
                code: 'ROUTE_NOT_FOUND',
            },
        });
    });
};

export default fp(errorHandlerPlugin, {
    name: 'error-handler-plugin',
});
