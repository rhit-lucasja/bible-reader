import type { Metadata } from 'next'
import './globals.css';
import { TRPCProvider } from '@/lib/trpc/provider'
import Navbar from '@/components/layout/navbar'

export const metadata: Metadata = {
    title: 'Ignis Divinus',
    description: 'Read and search the Bible with AI-powered semantic search'
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-serif">
                <TRPCProvider>
                    <Navbar />
                    <main className="mx-auto max-w-7xl">
                        {children}
                    </main>
                </TRPCProvider>
            </body>
        </html>
    )
}