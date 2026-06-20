export * from './generated/index'
export { PrismaClient } from './generated/index'

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
} from './generated/index'

import { PrismaClient } from './generated/index'

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = db
}