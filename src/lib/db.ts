import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma || new PrismaClient()

// We do this because of NextJS "hot reload" each time a file changes.
// This will cause it to spin up multiple copies of PrismaClient.
// Setting it to globalThis, we can check if PrismaClient has already been
// initialized. The reason why we're using globalThis is because globalThis
// is not affected by hot reload.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}
