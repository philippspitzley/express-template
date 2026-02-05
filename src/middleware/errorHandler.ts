import { DrizzleQueryError } from 'drizzle-orm'
import type { ErrorRequestHandler } from 'express'
import { isDev } from '../../env.ts'

export type ValidationErrorDetails = {
  field: string
  message: string
}

export class AppError extends Error {
  status: number
  details?: ValidationErrorDetails[]

  constructor(message: string, status = 500) {
    super(message)
    this.name = this.constructor.name
    this.status = status
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: ValidationErrorDetails[]) {
    super(message, 400)
    this.details = details
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401)
  }
}

export class JWTExpiredError extends UnauthorizedError {
  constructor(message: string) {
    super(message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409)
  }
}

export class InternalServerError extends AppError {
  constructor(message: string) {
    super(message, 500)
  }
}

export class DBConnectionError extends InternalServerError {
  constructor(message: string) {
    super(message)
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let outputError: AppError = new InternalServerError('Something went wrong.')
  let errStack: string | undefined = undefined
  let isUnhandledError = true

  if (err instanceof Error) {
    outputError.message = err.message
    errStack = err.stack
  }

  if (err instanceof AppError) {
    outputError = err
    isUnhandledError = false
  }

  if (err instanceof DrizzleQueryError) {
    outputError = new DBConnectionError('Connection to db failed.')
    isUnhandledError = false
  }

  // Log only unhandled errors in dev
  if (isDev() && isUnhandledError) console.error('🚨 Unhandled error:', err)

  res.status(outputError.status).json({
    error: {
      name: outputError.name,
      status: outputError.status,
      message: outputError.message,
      instance: req.originalUrl,
      ...(outputError.details && { details: outputError.details }),
    },

    // verbose error logging in development
    ...(isDev() && { stack: errStack }),
  })
}
