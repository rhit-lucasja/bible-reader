import { createTRPCClient, httpBatchLink } from '@trpc/client'
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

async function main() {
    const result = await client.reference.getChapter.query({
        book_id: 'GEN',
        chapter_number: 1,
        translation_id: 'NABRE'
    })

    console.log(JSON.stringify(result, null, 2))
}

main().catch(console.error)