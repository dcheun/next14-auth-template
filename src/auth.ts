import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth from 'next-auth'
import authConfig from './auth.config'
import { getAccountByUserId } from './data/account'
import { getTwoFactorConfirmationByUserId } from './data/two-factor-confirmation'
import { getUserById } from './data/user'
import { db } from './lib/db'

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  events: {
    linkAccount: async ({ user }) => {
      // Automatically update emailVerified field for OAuth users.
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    },
  },
  callbacks: {
    signIn: async ({ user, account }) => {
      console.log({
        signIn: {
          user,
          account,
        },
      })

      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') {
        return true
      }

      if (!user.id) return false

      const existingUser = await getUserById(user.id)

      // Block if user has not verified email.
      if (!existingUser?.emailVerified) return false

      // 2FA check
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        )

        if (!twoFactorConfirmation) {
          return false
        }

        // Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: {
            id: twoFactorConfirmation.id,
          },
        })
      }

      return true
    },
    session: async ({ token, session }) => {
      console.log({
        session: token,
      })
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      if (token.role && session.user) {
        session.user.role = token.role
      }
      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
        session.user.name = token.name
        session.user.email = token.email!
        session.user.isOauth = token.isOauth as boolean
      }
      return session
    },
    jwt: async ({ token }) => {
      console.log('I AM BEING CALLED AGAIN')
      if (!token.sub) {
        return token
      }
      const existingUser = await getUserById(token.sub)
      if (!existingUser) {
        return token
      }

      const existingAccount = await getAccountByUserId(existingUser.id)

      token.name = existingUser.name
      token.email = existingUser.email
      token.role = existingUser.role
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled
      token.isOauth = !!existingAccount
      return token
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
})
