export const dynamic = 'force-dynamic'

interface ReadPageProps {
    params: Promise<{
        bookId: string
        chapter: string
    }>
    searchParams: Promise<{
        translation?: string
    }>
}

export default async function ReadPage({ params, searchParams }: ReadPageProps) {
    const { bookId, chapter } = await params
    const { translation = 'NABRE' } = await searchParams

    return (
        <div className="p-8">
            <p className="text-zinc-400 text-md">
                {bookId} | Chapter {chapter} | {translation}
            </p>
        </div>
    )
}