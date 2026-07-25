// tRPC server entry point
import express from 'express'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './routers'
import { createContext } from './trpc'

const app = express()

const corsOptions = {
    origin: process.env.WEB_URL?.split(',').map(o => o.trim()) ?? ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'cookie']
}

// explicitly handle OPTIONS preflight before middleware
app.options('*', cors(corsOptions))
app.use(cors(corsOptions))

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