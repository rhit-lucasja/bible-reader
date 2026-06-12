import { PrismaClient } from './generated'
import { objectEnumNames } from './generated/runtime/library'

const prisma = new PrismaClient()

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
const EMBEDDING_MODEL = 'nomic-embed-text'
const TRANSLATION = 'BSB'
const BATCH_SIZE = 50 // verses fetched from DB per page
const CONCURRENCY = 5 // parallel Ollama requests

interface OllamaEmbeddingResponse {
    embedding: number[]
}

async function getEmbedding(text: string): Promise<number[]> {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: EMBEDDING_MODEL, prompt: text }),
    })

    if (!res.ok) {
        throw new Error(`Ollama embedding request failed: ${res.status} ${res.statusText}`)
    }

    const data = (await res.json()) as OllamaEmbeddingResponse
    return data.embedding
}

// converts a JS number array to the pgvector literal format
function toVectorLiteral(embedding: number[]): string {
    return `[${embedding.join(',')}]`
}

async function embedBatch(verses: { id: number; text: string }[]) {
    // process batch of verses with limited concurrency
    for (let i = 0; i < verses.length; i += CONCURRENCY) {
        const chunk = verses.slice(i, i + CONCURRENCY)

        await Promise.all(
            chunk.map(async (verse) => {
                const embedding = await getEmbedding(verse.text)
                const vectorLiteral = toVectorLiteral(embedding)

                // raw SQL required since Prisma client can't write to Unsupported("vector(768)") naturally
                await prisma.$executeRawUnsafe(
                    `UPDATE "Verse" SET embedding = $1::vector WHERE id = $2`,
                    vectorLiteral,
                    verse.id
                )
            })
        )
    }
}

async function main() {
    console.log(`Embedding verses for translation: ${TRANSLATION}`)
    console.log(`Using Ollama at ${OLLAMA_BASE_URL} with model ${EMBEDDING_MODEL}`)

    const total = await prisma.verse.count({
        where: { translationId: TRANSLATION }
    })
    console.log(`Total verses to embed: ${total}`)

    let processed = 0
    let cursor: number | undefined

    while (true) {
        const verses = await prisma.verse.findMany({
            where: { translationId: TRANSLATION },
            select: { id: true, text: true },
            orderBy: { id: 'asc' },
            take: BATCH_SIZE,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
        })

        if (verses.length === 0) break

        await embedBatch(verses)

        processed += verses.length
        cursor = verses[verses.length - 1].id

        console.log(`Progress: ${processed}/${total} (${((processed / total) * 100).toFixed(1)}%)`)

    }

    console.log('Finished embeddings.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })