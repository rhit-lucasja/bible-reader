import { router } from '../trpc'
import { referenceRouter } from './reference'
import { translationRouter } from './translation'

export const appRouter = router({
    reference: referenceRouter,
    translation: translationRouter
})

export type AppRouter = typeof appRouter