import type { NextFunction, Request, Response } from 'express'
import { NotFoundError } from './errors.ts'

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Not found: ${req.originalUrl}`)
  next(error)
}
