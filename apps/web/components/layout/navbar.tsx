import { BookOpenText } from 'lucide-react';

export default function Navbar() {
    

    return (
        <nav className="fixed top-0 left-0 w-full h-12 bg-blue-900 text-white text-2xl font-bold flex flex-col gap-8 pl-4 py-2 z-50">
            <a href="/">
                <BookOpenText />
                Ignis Divinus
            </a>
        </nav>
    )
}