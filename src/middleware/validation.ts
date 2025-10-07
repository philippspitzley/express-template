import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import type { ZodType } from 'zod'

/**
 * Validates request body against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateBody = <T extends ZodType<any>>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        error: 'validation_failed',
        message: 'Invalid request body',
        details: result.error.issues.map((issue) => ({
          path: issue.path,
          field: issue.path.length ? issue.path.join('.') : 'body',
          message: issue.message,
        })),
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
export const validateQuery = <T extends ZodType<any>>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      return res.status(400).json({
        error: 'validation_failed',
        message: 'Invalid query parameters',
        details: result.error.issues.map((issue) => ({
          path: issue.path,
          field: issue.path.length ? issue.path.join('.') : 'query',
          message: issue.message,
        })),
      })
    }

    req.query = result.data as any
    next()
  }
}

/**
 * Validates request URL parameters against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateParams = <T extends ZodType<any>>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params)

    if (!result.success) {
      return res.status(400).json({
        error: 'validation_failed',
        message: 'Invalid URL parameters',
        details: result.error.issues.map((issue) => ({
          path: issue.path,
          field: issue.path.length ? issue.path.join('.') : 'params',
          message: issue.message,
        })),
      })
    }

    req.params = result.data as any
    next()
  }
}
