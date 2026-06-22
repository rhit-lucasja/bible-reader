import { router } from '../trpc'
import { referenceRouter } from './reference'
import { translationRouter } from './translation'
import { searchRouter } from './search'

export const appRouter = router({
    reference: referenceRouter,
    translation: translationRouter,
    search: searchRouter
})

export type AppRouter = typeof appRouter