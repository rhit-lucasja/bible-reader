import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@bible-reader/api'

export const trpc = createTRPCReact<AppRouter>()