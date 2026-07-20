import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { db } from '@bible-reader/db'
import { decode } from '@auth/core/jwt'

async function getUserIdFromRequest(
    req: CreateExpressContextOptions['req']
): Promise<string | null> {
    try {
        // Auth.js stores session token in a cookie
        const cookieHeader = req.headers.cookie ?? ''
        const cookies = Object.fromEntries(
            cookieHeader.split(';').map((c) => {
                const [key, ...val] = c.trim().split('=')
                return [key.trim(), decodeURIComponent(val.join('='))]
            })
        )

        // Auth.js v5 users cookie name for JWT sessions
        const token =
            cookies['authjs.session-token'] ??
            cookies['__Secure-authjs.session-token'] // for https

        if (!token) return null

        const decoded = await decode({
            token,
            secret: process.env.NEXTAUTH_SECRET!,
            salt: 'authjs.session-token'
        })

        if (!decoded) return null

        console.log('JWT DEBUG: decoded payload keys:', Object.keys(decoded))
        console.log('JWT DEBUG: decoded sub:', decoded.sub)

        return decoded.sub ?? null
    } catch (err) {
        // invalid or expired token
        console.error('JWT DEBUG: decrypt failed:', err)
        return null
    }
}

export async function createContext({ req, res }: CreateExpressContextOptions) {
    const userId = await getUserIdFromRequest(req)
    return { db, req, res, userId }
}

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create({
    transformer: superjson
})

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    return next({ ctx: { ...ctx, userId: ctx.userId } })
})