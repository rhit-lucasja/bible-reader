import Link from 'next/link'
import { Flame } from 'lucide-react'

// standalone not-found page that doesn't rely on session providers
// avoid prerender static errors from tRPC hooks
export default function NotFound() {
    return (
        <div className="text-center space-y-4">
            <Flame className="h-12 w-12 mx-auto text-zinc-400" />
            <h1 className="text-2xl text-zinc-900 dark:text-zinc-100">
                Page Not Found
            </h1>
            <p className="text-zinc-500">
                The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/" className="inline-block px-4 py-2 rounded-log bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:opacity-80 transition-opacity">
                Go home
            </Link>
        </div>
    )
}