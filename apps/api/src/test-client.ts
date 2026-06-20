import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { writeFileSync } from 'node:fs'
import superjson from 'superjson'
import type { AppRouter } from './routers'

const client = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: 'http://localhost:3001/trpc',
            transformer: superjson
        })
    ]
})

async function test_getBook(
        translation_id: string | undefined,
        book_id: string,
        opath: string
    ) {
    const result = await client.reference.getBook.query({
        book_id,
        translation_id
    })

    writeFileSync(opath, JSON.stringify(result, null, 2))
}

async function test_getChapter(
        translation_id: string | undefined,
        book_id: string,
        chapter_number: number,
        opath: string
    ) {
    const result = await client.reference.getChapter.query({
        book_id,
        chapter_number,
        translation_id
    })

    writeFileSync(opath, JSON.stringify(result, null, 2))
}

async function test_getVerse(
        translation_id: string | undefined,
        book_id: string,
        chapter_number: number,
        verse_number: number,
        opath: string
    ) {
    const result = await client.reference.getVerse.query({
        book_id,
        chapter_number,
        verse_number,
        translation_id
    })

    writeFileSync(opath, JSON.stringify(result, null, 2))
}

async function test_getVerseRange(
        translation_id: string | undefined,
        book_id: string,
        chapter_start: number,
        verse_start: number,
        chapter_end: number,
        verse_end: number,
        opath: string
    ) {
    const result = await client.reference.getVerseRange.query({
        book_id,
        chapter_start,
        chapter_end,
        verse_start,
        verse_end,
        translation_id
    })

    writeFileSync(opath, JSON.stringify(result, null, 2))
}

async function test_listTranslations(
    opath: string
) {
    const result = await client.translation.listTranslations.query()
    writeFileSync(opath, JSON.stringify(result, null, 2))
}

async function test_listBooks(
    translation_id: string,
    opath: string
) {
    const result = await client.translation.listBooks.query({
        translation_id
    })
    writeFileSync(opath, JSON.stringify(result, null, 2))
}

async function main() {

    const OB = './test-output/get-book.out'
    const OC = './test-output/get-chapter.out'
    const OV = './test-output/get-verse.out'
    const OVR = './test-output/get-verse-range.out'
    const OLT = './test-output/list-translations.out'
    const OLB = './test-output/list-books.out'

    test_getBook('NABRE', 'JUD', OB)

    test_getChapter('NABRE', 'PSA', 23, OC)

    test_getVerse('NABRE', 'JHN', 3, 16, OV)
    
    test_getVerseRange('NABRE', 'MAT', 4, 23, 5, 11, OVR)

    test_listTranslations(OLT)

    test_listBooks('NABRE', OLB)

}

main().catch(console.error)