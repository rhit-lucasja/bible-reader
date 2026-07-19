import { z } from 'zod'
import { router, protectedProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const userRouter = router({

    // get the current user's preferences
    // public so we can call it without auth (returning null if not logged in)
    getPreferences: publicProcedure.query(async ({ ctx }) => {
        if (!ctx.userId) return null
        const user = await ctx.db.user.findUnique({
            where: { id: ctx.userId },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                preferred_translation_id: true
            }
        })

        if (!user) return null
        return user
    }),

    // update preferred translation
    updatePreferredTranslation: protectedProcedure
        .input(
            z.object({
                translation_id: z.string().min(1).max(20)
            })
        )
        .mutation(async ({ ctx, input }) => {
            // verify translation actually exists before saving it
            const translation = await ctx.db.translation.findUnique({
                where: { id: input.translation_id },
                select: { id: true, english_name: true }
            })

            if (!translation) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Translation ${input.translation_id} does not exist`
                })
            }

            const updated = await ctx.db.user.update({
                where: { id: ctx.userId },
                data: { preferred_translation_id: input.translation_id },
                select: {
                    id: true,
                    preferred_translation_id: true
                }
            })

            return updated
        }),

    // update display name for account
    updateName: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1).max(100)
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.db.user.update({
                where: { id: ctx.userId },
                data: { name: input.name },
                select: {id: true, name: true }
            })
        })
})