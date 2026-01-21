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
  let outputError: AppError
  let isUnknownError = true

  const errCode =
    (err as { code?: string })?.code ??
    (err as { cause?: { code?: string } })?.cause?.code

  const errMessage =
    err instanceof Error ? err.message : 'Internal Server Error'

  const errStack = err instanceof Error ? err.stack : undefined

  outputError = new InternalServerError(errMessage)

  if (err instanceof AppError) {
    outputError = err
    isUnknownError = false
  }

  if (errCode === 'ECONNREFUSED') {
    outputError = new DBConnectionError('Connection to db failed.')
    isUnknownError = false
  }

  // Log only Unkown Errors in dev
  if (isDev() && isUnknownError) console.error(err)

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
