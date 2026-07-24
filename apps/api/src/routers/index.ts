import { router } from '../trpc'
import { referenceRouter } from './reference'
import { translationRouter } from './translation'
import { searchRouter } from './search'
import { userRouter } from './user'

export const appRouter = router({
    reference: referenceRouter,
    translation: translationRouter,
    search: searchRouter,
    user: userRouter
})

export type AppRouter = typeof appRouter