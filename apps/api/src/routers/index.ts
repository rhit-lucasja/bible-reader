import { router } from '../trpc'
import { referenceRouter } from './reference'
import { translationRouter } from './translation'
import { searchRouter } from './search'
import { userRouter } from './user'
import { historyRouter } from './history'
import { bookmarkRouter } from './bookmark'

export const appRouter = router({
    reference: referenceRouter,
    translation: translationRouter,
    search: searchRouter,
    user: userRouter,
    history: historyRouter,
    bookmark: bookmarkRouter,
})

export type AppRouter = typeof appRouter