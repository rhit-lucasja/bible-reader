const NOMIC_API_URL = 'https://api-atlas.nomic.ai/v1/embedding/text'
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
const EMBEDDING_PROVIDER = process.env.EMBEDDING_PROVIDER ?? 'nomic'

export async function getQueryEmbedding(query: string): Promise<number[]> {
    if (EMBEDDING_PROVIDER === 'ollama') {
        return getOllamaEmbedding(`search_query: ${query}`)
    }
    return getNomicEmbedding(query)
}

async function getNomicEmbedding(text: string): Promise<number[]> {
    const token = process.env.NOMIC_API_KEY
    if (!token) throw new Error('NOMIC_API_KEY is not set')
    
    console.log('getNomicEmbedding for:', text, 'with key:', token)
    const response = await fetch(NOMIC_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            texts: [
                text
            ],
            model: 'nomic-embed-text-v1',
            task_type: 'search_query',

        }),
        signal: AbortSignal.timeout(15000) // 15s timeout
    })
    console.log(response)

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Nomic Atlas embedding failed (${response.status}): ${error}`)
    }

    const data = await response.json() as number[]
    return data
}

async function getOllamaEmbedding(text: string): Promise<number[]> {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'nomic-embed-text', prompt: text}),
        signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    if (!response.ok) {
        throw new Error(`Ollama embedding failed: ${response.statusText}`)
    }

    const data = await response.json() as { embedding: number[] }
    return data.embedding
}