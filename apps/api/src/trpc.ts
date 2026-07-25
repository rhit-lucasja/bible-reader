import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { db } from '@bible-reader/db'
import { decode } from '@auth/core/jwt'

async function getUserIdFromRequest(
    req: CreateExpressContextOptions['req']
): Promise<string | null> {
    try {

        console.log('JWT DEBUG: raw cookie header:', req.headers.cookie)
        console.log('JWT DEBUG: x-forwarded-for:', req.headers['x-forwarded-for'])
        console.log('JWT DEBUG: origin:', req.headers.origin)
        console.log('JWT DEBUG: host:', req.headers.host)

        // Auth.js stores session token in a cookie
        const cookieHeader = req.headers.cookie ?? ''
        const cookies = Object.fromEntries(
            cookieHeader.split(';').map((c) => {
                const [key, ...val] = c.trim().split('=')
                return [key.trim(), decodeURIComponent(val.join('='))]
            })
        )

        // Auth.js v5 users cookie name for JWT sessions
        const secureCookieName = '__Secure-authjs.session-token'
        const regularCookieName = 'authjs.session-token'

        const isSecure = secureCookieName in cookies
        const cookieName = isSecure ? secureCookieName : regularCookieName
        const token = cookies[cookieName]

        if (!token) {
            console.log('JWT DEBUG: no session token cookie found')
            return null
        }

        const decoded = await decode({
            token,
            secret: process.env.NEXTAUTH_SECRET!,
            salt: cookieName
        })

        if (!decoded) return null

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