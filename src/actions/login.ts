'use server'

import { AuthError } from 'next-auth'

import { signIn } from '@/auth'
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation'
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token'
import { getUserByEmail } from '@/data/user'
import { db } from '@/lib/db'
import { sendTwoFactorTokenEmail, sendVerificationEmail } from '@/lib/mail'
import { generateTwoFactorToken, generateVerificationToken } from '@/lib/tokens'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { LoginSchema, LoginSchemaType } from '@/schemas'

export const login = async (
  values: LoginSchemaType,
  callbackUrl?: string | null
) => {
  const validatedFields = LoginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' }
  }

  const { email, password, code } = validatedFields.data

  const existingUser = await getUserByEmail(email)

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: 'Email does not exist!' }
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    )

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    )

    return {
      success: 'Confirmation email sent!',
    }
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email)
      if (!twoFactorToken) {
        return { error: 'Invalid code!' }
      }

      if (twoFactorToken.token !== code) {
        return { error: 'Invalid code!' }
      }

      // Check if token has expired.
      const hasExpired = new Date() > new Date(twoFactorToken.expires)
      if (hasExpired) {
        return { error: 'Code expired!' }
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      })

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      )

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        })
      }

      await db.twoFactorConfirmation.create({
        data: { userId: existingUser.id },
      })
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email)
      // await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token)
      console.log({ twoFactorToken })

      return { twoFactorToken: true }
    }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    })
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials!' }
        default:
          return { error: 'Something went wrong!' }
      }
    }
    throw err
  }

  return { success: 'Login successful' }
}
