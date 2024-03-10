'use server'

import { getUserByEmail } from '@/data/user'
import { getVerificationTokenByToken } from '@/data/verification-token'
import { db } from '@/lib/db'

export const newVerification = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token)

  if (!existingToken) {
    return {
      error: 'Invalid token!',
    }
  }

  const hasExpired = new Date() > new Date(existingToken.expires)

  if (hasExpired) {
    return {
      error: 'Token expired!',
    }
  }

  const existingUser = await getUserByEmail(existingToken.email)

  if (!existingUser) {
    return {
      error: 'Email does not exist!',
    }
  }

  await db.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      emailVerified: new Date(),
      // Set email field in case user changes their email.
      // We are not updating the email immediately, but instead send
      // them the verification email, and then updating afterwards.
      email: existingToken.email,
    },
  })

  await db.verificationToken.delete({
    where: {
      id: existingToken.id,
    },
  })

  return {
    success: 'Email verified',
  }
}
