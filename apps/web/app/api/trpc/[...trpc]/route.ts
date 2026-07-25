import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const RENDER_API_URL = process.env.INTERNAL_API_URL ?? 'https://bible-reader-api.onrender.com'
const PROXY_SECRET = process.env.PROXY_SECRET ?? ''

async function handler(req: NextRequest) {
    // read Auth.js session server-side, works because browser sent cookie same origin
    const session = await auth()

    // forward the URL from proxy path to backend route
    const { search } = new URL(req.url)
    const trpcPath = req.url.match(/\/api\/trpc\/(.*?)(\?|$)/)?.[1] ?? ''
    const targetUrl = `${RENDER_API_URL}/trpc/${trpcPath}${search}`

    // build headers from scratch rather than forwarding all browser
    const headers = new Headers()
    headers.set('content-type', req.headers.get('content-type') ?? 'application/json')

    // proxy secret to prove to Render that request came from Next.js proxy and not third party
    headers.set('x-proxy-secret', PROXY_SECRET)

    // if user is authenticated, attach verified userId
    // trusting server-to-server interactions, not browser cookies
    if (session?.user?.id) {
        headers.set('x-verified-user-id', session.user.id)
    }

    const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: req.method !== 'GET' ? req.body : undefined,
        // duplex required for streaming request bodies in Node
        // @ts-ignore
        duplex: 'half'
    })

    return new NextResponse(response.body, {
        status: response.status,
        headers: {
            'content-type': response.headers.get('content-type') ?? 'application/json',
        }
    })
}

export const GET = handler
export const POST = handler