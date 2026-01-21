import argon2 from 'argon2'
import type { Request } from 'express'
import { UnauthorizedError } from '../../middleware/errorHandler.ts'

/**
 * Hashes a plain text password using Argon2.
 * @param password - The plain text password to hash
 * @returns The hashed password
 */
export const hashPassword = async (chars: string) => {
  return argon2.hash(chars)
}

/**
 * Verifies a plain text password against an Argon2 hash.
 * @param password - The plain text password to verify
 * @param hash - The Argon2 hash to compare against
 * @returns True if the password matches the hash, false otherwise
 */
export const verifyPassword = async (chars: string, hash: string) => {
  return await argon2.verify(hash, chars)
}

/**
 * Extracts the bearer token from the Authorization header.
 * @param req - The Express request object
 * @returns The extracted bearer token
 * @throws {UnauthorizedError} If no Authorization header is present
 */
export function getBearerToken(req: Request): string {
  let bearer_token = req.get('authorization')

  if (!bearer_token) {
    throw new UnauthorizedError('No Bearer Token')
  }

  bearer_token = bearer_token.replace('Bearer ', '').trim()

  return bearer_token
}
