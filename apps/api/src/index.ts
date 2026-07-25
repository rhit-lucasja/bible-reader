// tRPC server entry point
import express from 'express'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './routers'
import { createContext } from './trpc'

const app = express()

app.use(cors({
    origin: process.env.WEB_URL ?? 'http://localhost:3000',
    credentials: true // required so as to send cookies cross-origin
}))

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