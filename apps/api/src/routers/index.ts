import { router } from '../trpc'
import { referenceRouter } from './reference'

export const appRouter = router({
    reference: referenceRouter
})

export type AppRouter = typeof appRouter