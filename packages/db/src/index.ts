export * from './generated'
export { PrismaClient } from './generated'

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
} from './generated'

import { PrismaClient } from './generated'

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = db
}