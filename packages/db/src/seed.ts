import { PrismaClient } from './generated'
import { helloaoAdapter } from './seed/sources/helloao'
import type { SourceAdapter } from './seed/types'

const prisma = new PrismaClient()

// map of translationId to the correct fetch adapter
const TRANSLATIONS: { id: string; sourceId: string; adapter: SourceAdapter }[] = [
    { id: 'KJV', sourceId: 'eng_kjv', adapter: helloaoAdapter },
    { id: 'BSB', sourceId: 'BSB', adapter: helloaoAdapter },
]

async function seedTranslation(
    translationId: string,
    sourceId: string,
    adapter: SourceAdapter,
) {
    console.log(`[${translationId}] fetching from ${adapter.name}...`)
    const translation = await adapter.fetchTranslation(sourceId)

    console.log(`[${translationId}] deleting existing data (if any)...`)
    await prisma.translation.deleteMany({ where: { id: translationId } })

    console.log(`[${translationId}] inserting translation row...`)
    await prisma.translation.create({
        data: {
            id: translationId,
            name: translation.name,
            englishName: translation.englishName,
            website: translation.website,
            licenseUrl: translation.licenseUrl,
            shortName: translation.shortName,
            language: translation.language,
            languageName: translation.languageName,
            languageEnglishName: translation.languageEnglishName,
            textDirection: translation.textDirection,
            numBooks: translation.numBooks,
            numChapters: translation.numChapters,
            numVerses: translation.numVerses,
        }
    })

    for (const book of translation.books) {
        console.log(`[${translationId}] inserting book ${book.id}...`)

        await prisma.book.create({
            data: {
                id: book.id,
                translationId: translationId,
                name: book.name,
                commonName: book.commonName,
                title: book.title,
                order: book.order,
                numChapters: book.chapters.length,
                numVerses: book.chapters.reduce((sum, ch) => sum + ch.verses.length, 0),
            }
        })

        for (const chapter of book.chapters) {
            await prisma.chapter.create({
                data: {
                    number: chapter.number,
                    bookId: book.id,
                    translationId: translationId,
                    numVerses: chapter.verses.length,
                }
            })

            // batch insert verses a chapter at a time
            await prisma.verse.createMany({
                data: chapter.verses.map((verse) => ({
                    number: verse.number,
                    chapterNumber: chapter.number,
                    bookId: book.id,
                    translationId: translationId,
                    text: verse.text,
                    content: verse.content as any,
                }))
            })
        }
    }

    console.log(`[${translationId}] done - ${translation.numVerses} verses inserted.`)
}

async function main() {
    for (const { id, sourceId, adapter } of TRANSLATIONS) {
        await seedTranslation(id, sourceId, adapter)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })