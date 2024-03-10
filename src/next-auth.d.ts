import NextAuth, { type DefaultSession } from 'next-auth'

export type ExtendedUser = DefaultSession['user'] & {
  role: UserRole
  isTwoFactorEnabled: boolean
  isOauth: boolean
}

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser
  }
}

import { JWT } from '@auth/core/jwt'
import { UserRole } from '@prisma/client'

declare module '@auth/core/jwt' {
  interface JWT {
    role?: UserRole
  }
}
