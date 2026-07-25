import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { db } from '@bible-reader/db'

const PROXY_SECRET = process.env.PROXY_SECRET ?? ''

function getUserIdFromRequest(
    req: CreateExpressContextOptions['req']
): string | null {
    // verify request came from Next.js proxy
    // reject third-party direct Render calls
    const proxySecret = req.headers['x-proxy-secret']
    if (!PROXY_SECRET || proxySecret !== PROXY_SECRET) {
        return null
    }

    // reader verified userId attached when proxy checks Auth.js session
    const userId = req.headers['x-verified-user-id']
    return typeof userId === 'string' && userId.length > 0 ? userId : null
}

export async function createContext({ req, res }: CreateExpressContextOptions) {
    const userId = getUserIdFromRequest(req)
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