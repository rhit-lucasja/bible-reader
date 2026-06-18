// tRPC server entry point
import express from 'express'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './routers/index'
import { createContext } from './trpc'

const app = express()

app.use(cors())

app.use(
    '/trpc',
    createExpressMiddleware({
        router: appRouter,
        createContext
    })
)

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
})

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`)
})