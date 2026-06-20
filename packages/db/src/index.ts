export * from '@prisma/client'
export { PrismaClient } from '@prisma/client'

// Explicitly re-export model types — Prisma 5 puts these here
export type {
  Verse,
  Book,
  Chapter,
  Translation,
  ChapterContentBlock,
  Bookmark,
  SearchHistory,
  ReadingHistory,
  User,
  Account,
  Session,
} from '@prisma/client'

import { PrismaClient } from '@prisma/client'

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = db
}