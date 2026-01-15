export type ValidationErrorDetails = {
  path: PropertyKey[]
  field: string
  message: string
}

export class AppError extends Error {
  status: number
  details?: ValidationErrorDetails[]
  type?: string
  isOperational: boolean

  constructor(message: string, status = 500, isOperational = true) {
    super(message)
    this.name = this.constructor.name
    this.status = status
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      ...(this.details && { details: this.details }),
      ...(this.type && { type: this.type }),
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: ValidationErrorDetails[]) {
    super(message, 400)
    this.details = details
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
