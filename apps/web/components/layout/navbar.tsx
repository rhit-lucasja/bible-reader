import { auth, signOut } from '@/auth';
import { BookOpenTextIcon, SearchIcon } from 'lucide-react';

export default async function Navbar() {
    const session = await auth()

    return (
        <nav className="fixed top-0 left-0 w-full h-12 bg-blue-900 text-white text-2xl font-bold flex gap-8 pl-2 py-2 z-50">
            <a href="/" className="flex gap-2">
                <BookOpenTextIcon className="h-9 w-auto" />
                Ignis Divinus
            </a>
            <a href="/read/GEN/1">
                Read the Bible
            </a>
            <a href="/search" className="flex gap-2">
                Search
                <SearchIcon className="h-7 w-auto" />
            </a>
            {session ? (
                <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }) }}>
                    <button type="submit">Sign out</button>
                </form>
            ) : (
                <a href="/auth/signin">
                    Sign In
                </a>
            )}
        </nav>
    )
}