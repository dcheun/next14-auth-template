import { UserRole } from '@prisma/client'
import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
  code: z.optional(z.string()),
})

export type LoginSchemaType = z.infer<typeof LoginSchema>

export const RegisterSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(6, {
    message: 'Minimum 6 characters required',
  }),
  name: z.string().min(1, {
    message: 'Name is required',
  }),
})

export type RegisterSchemaType = z.infer<typeof RegisterSchema>

export const ResetSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
})

export type ResetSchemaType = z.infer<typeof ResetSchema>

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: 'Minimum 6 characters required',
  }),
})

export type NewPasswordSchemaType = z.infer<typeof NewPasswordSchema>

// NOTE: Not using min(6) in password fields as a workaround for React
// complaining about uncontrolled to controlled field when using undefined
// as default values.
export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string()),
    newPassword: z.optional(z.string()),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false
      }

      return true
    },
    {
      message: 'Password and new password are required together',
      path: ['newPassword'],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false
      }
      return true
    },
    {
      message: 'Password and new password are required together',
      path: ['password'],
    }
  )
  .refine(
    (data) => {
      if (data.password && data.password.length < 6) {
        return false
      }
      return true
    },
    {
      message: 'Password must be at least 6 character(s)',
      path: ['password'],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length < 6) {
        return false
      }
      return true
    },
    {
      message: 'Password must be at least 6 character(s)',
      path: ['newPassword'],
    }
  )

export type SettingsSchemaType = z.infer<typeof SettingsSchema>
