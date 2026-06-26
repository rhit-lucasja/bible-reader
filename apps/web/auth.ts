import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@bible-reader/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60 // 30 day limit on sessions
    },
    callbacks: {
        // runs when JWT is created or updated
        // persists userId into the token so API can read that value
        async jwt({ token, user }) {
            if (user) {
                token.userId = user.id
            }
            return token
        },
        // runs when session is accessed client-side
        // exposes userId to the frontend session object
        async session({ session, token }) {
            if (token.userId) {
                session.user.id = token.userId as string
            }
            return session
        }
    },
    pages: {
        signIn: '/auth/signin', // frontend sign-in page
        error: '/auth/error'
    }
})