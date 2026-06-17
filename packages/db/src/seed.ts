import { PrismaClient } from './generated'
import { HelloaoAdapter } from './seed/sources/helloao'
import { NabreAdapter } from './seed/sources/nabre'
import type { SourceAdapter } from './seed/types'

const prisma = new PrismaClient()

// map of translationId to the correct fetch adapter
const TRANSLATIONS: { id: string; sourceId: string; adapter: SourceAdapter }[] = [
    { id: 'KJV', sourceId: 'eng_kjv', adapter: HelloaoAdapter },
    { id: 'BSB', sourceId: 'BSB', adapter: HelloaoAdapter },
    { id: 'NABRE', sourceId: 'NABRE', adapter: NabreAdapter }
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
            english_name: translation.englishName,
            website: translation.website,
            license_url: translation.licenseUrl,
            short_name: translation.shortName,
            language: translation.language,
            language_name: translation.languageName,
            language_english_name: translation.languageEnglishName,
            text_direction: translation.textDirection,
            num_books: translation.numBooks,
            num_chapters: translation.numChapters,
            num_verses: translation.numVerses,
        }
    })

    for (const book of translation.books) {
        console.log(`[${translationId}] inserting book ${book.id}...`)

        await prisma.book.create({
            data: {
                id: book.id,
                translation_id: translationId,
                name: book.name,
                common_name: book.commonName,
                title: book.title,
                order: book.order,
                num_chapters: book.chapters.length,
                num_verses: book.chapters.reduce((sum, ch) => sum + ch.verses.length, 0),
            }
        })

        for (const chapter of book.chapters) {
            await prisma.chapter.create({
                data: {
                    number: chapter.number,
                    book_id: book.id,
                    translation_id: translationId,
                    num_verses: chapter.verses.length,
                }
            })

            // batch insert verses a chapter at a time
            await prisma.verse.createMany({
                data: chapter.verses.map((verse) => ({
                    number: verse.number,
                    chapter_number: chapter.number,
                    book_id: book.id,
                    translation_id: translationId,
                    text: verse.text,
                    content: verse.content as any,
                }))
            })

            await prisma.chapterContentBlock.createMany({
                data: chapter.layout.map((block, index) => ({
                    chapter_number: chapter.number,
                    book_id: book.id,
                    translation_id: translationId,
                    order: index,
                    block_type: block.type,
                    heading_text: block.type === 'heading' ? block.text : null,
                    verse_number: block.type === 'verse' ? block.number: null
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