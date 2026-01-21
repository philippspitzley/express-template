import type { NextFunction, Request, Response } from 'express'

import type { ZodType } from 'zod'
import { ValidationError } from './errorHandler.ts'

/**
 * Validates request body against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      throw new ValidationError(
        'Invalid request body',
        result.error.issues.map((issue) => ({
          field: issue.path.length ? issue.path.join('.') : 'body',
          message: issue.message,
        })),
      )
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
      throw new ValidationError(
        'Invalid query parameters',
        parsedQuery.error.issues.map((issue) => ({
          field: issue.path.length ? issue.path.join('.') : 'query',
          message: issue.message,
        })),
      )
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
      throw new ValidationError(
        'Invalid URL parameters',
        result.error.issues.map((issue) => ({
          field: issue.path.length ? issue.path.join('.') : 'params',
          message: issue.message,
        })),
      )
    }

    req.params = result.data as Request['params']
    next()
  }
}
