import type { NextFunction, Request, Response } from 'express'
import { NotFoundError } from './errorHandler.ts'

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Not found: ${req.originalUrl}`)
  next(error)
}
