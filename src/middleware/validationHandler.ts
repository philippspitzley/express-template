import type { NextFunction, Request, Response } from 'express'

import type { ZodType } from 'zod'
import { ValidationError } from '../errors.ts'

/**
 * Validates request body against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const error = new ValidationError(
        'Invalid request body',
        result.error.issues.map((issue) => ({
          path: issue.path,
          field: issue.path.length ? issue.path.join('.') : 'body',
          message: issue.message,
        })),
      )

      return res.status(400).json({
        error,
      })
    }

    req.body = result.data
    next()
  }
}

/**
 * Validates request query parameters against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateQuery = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsedQuery = schema.safeParse(req.query)

    if (!parsedQuery.success) {
      const error = new ValidationError(
        'Invalid query parameters',
        parsedQuery.error.issues.map((issue) => ({
          path: issue.path,
          field: issue.path.length ? issue.path.join('.') : 'query',
          message: issue.message,
        })),
      )
      return res.status(400).json({ error })
    }

    req.query = parsedQuery.data as Request['query']
    next()
  }
}

/**
 * Validates request URL parameters against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateParams = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params)

    if (!result.success) {
      const error = new ValidationError(
        'Invalid URL parameters',
        result.error.issues.map((issue) => ({
          path: issue.path,
          field: issue.path.length ? issue.path.join('.') : 'params',
          message: issue.message,
        })),
      )
      return res.status(400).json({ error })
    }

    req.params = result.data as Request['params']
    next()
  }
}
