import type { NextFunction, Request, Response } from 'express'
import { isDev } from '../../env.ts'
import { AppError, ValidationError } from '../errors.ts'



const isJsonParseError = (err: any): boolean => {
  return (
    err.name === 'SyntaxError' &&
    err.type === 'entity.parse.failed' &&
    'body' in err
  )
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let error: AppError
  let isUnknownError = false

  // Handle specific error types

  if (isJsonParseError(err)) {
    const details = [
      {
        path: ['body'],
        field: '',
        message: `Invalid input: expected json, received ${err.body}`,
      },
    ]
    error = new ValidationError('Invalid Body', details)
  } else if (err instanceof AppError) {
    // Catches AppError and subclasses (NotFoundError, ValidationError, etc.)
    error = err
  } else {
    // Unknown Error
    isUnknownError = true
    error = new AppError(
      err.message || 'Internal Server Error',
      err.status || 500,
    )
  }

  // Log only Unkown Errors in dev
  if (isDev() && isUnknownError) console.error(err.stack)

  res.status(error.status).json({
    error: error,

    // verbose error logging in development
    ...(isDev() && {
      stack: err.stack,
    }),
  })
}
