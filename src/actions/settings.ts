'use server'

import bcrypt from 'bcryptjs'

import { getUserByEmail, getUserById } from '@/data/user'
import { currentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/mail'
import { generateVerificationToken } from '@/lib/tokens'
import type { SettingsSchemaType } from '@/schemas'

export const settings = async (values: SettingsSchemaType) => {
  const user = await currentUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const dbUser = await getUserById(user.id!)

  if (!dbUser) {
    return { error: 'Unauthorized' }
  }

  // Oauth users cannot change these fields.
  if (user.isOauth) {
    values.email = undefined
    values.password = undefined
    values.newPassword = undefined
    values.isTwoFactorEnabled = undefined
  }

  // Use undefined so it doesn't update Prisma with an empty string.
  values.name = values.name === '' ? undefined : values.name
  values.email = values.email === '' ? undefined : values.email
  values.password = values.password === '' ? undefined : values.password
  values.newPassword =
    values.newPassword === '' ? undefined : values.newPassword

  if (values.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email)

    if (existingUser && existingUser.id !== user.id) {
      return { error: 'Email already in use!' }
    }

    const verificationToken = await generateVerificationToken(values.email)

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    )

    return { success: 'Verification email sent!' }
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordMatch = await bcrypt.compare(values.password, dbUser.password)

    if (!passwordMatch) {
      return { error: 'Incorrect password!' }
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10)
    values.password = hashedPassword
    values.newPassword = undefined
  }

  await db.user.update({
    where: { id: dbUser.id },
    data: { ...values },
  })

  return { success: 'Settings updated!' }
}
