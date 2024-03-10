import bcrypt from 'bcryptjs'
import type { NextAuthConfig } from 'next-auth'
import azureAd from 'next-auth/providers/azure-ad'
import credentials from 'next-auth/providers/credentials'
import github from 'next-auth/providers/github'
import google from 'next-auth/providers/google'
import { getUserByEmail } from './data/user'
import { LoginSchema } from './schemas'

export default {
  providers: [
    // azureAd,
    // google,
    github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    credentials({
      authorize: async (creds) => {
        const validatedFields = LoginSchema.safeParse(creds)

        if (!validatedFields.success) {
          return null
        }

        const { email, password } = validatedFields.data

        const user = await getUserByEmail(email)
        if (!user || !user.password) {
          // E.g.: If the user signed up with Google or GitHub and then
          // try to use the credentials provider.
          return null
        }

        const passwordsMatch = await bcrypt.compare(password, user.password)

        if (passwordsMatch) {
          return user
        }

        return null
      },
    }),
  ],
} satisfies NextAuthConfig
