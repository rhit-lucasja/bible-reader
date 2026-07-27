const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/nomic-ai/nomic-embed-text-v1'
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
const EMBEDDING_PROVIDER = process.env.EMBEDDING_PROVIDER ?? 'huggingface'

// whether to use task prefixes (technically required)
const USE_PREFIXES = false

export async function getQueryEmbedding(query: string): Promise<number[]> {
    const text = USE_PREFIXES ? `search_query: ${query}` : query

    if (EMBEDDING_PROVIDER === 'ollama') {
        return getOllamaEmbedding(text)
    }
    return getHuggingFaceEmbedding(text)
}

async function getHuggingFaceEmbedding(text: string): Promise<number[]> {
    const token = process.env.HF_API_TOKEN
    if (!token) throw new Error('HF_API_TOKEN is not set')
    
    const response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: text }),
        signal: AbortSignal.timeout(15000) // 15s timeout
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`HuggingFace embedding failed (${response.status}): ${error}`)
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