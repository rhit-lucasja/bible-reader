import { cn } from '@/lib/utils'

interface ContentBlock {
    type: string
    heading_text: string | null
    chapter_number?: number
    verse: {
        id: number
        number: number
        text: string
        chapter_number: number
        book_id: string
        translation_id: string
    } | null
}

interface ChapterReaderProps {
    blocks: ContentBlock[]
}

export function ChapterReader({ blocks }: ChapterReaderProps) {
    return (
        <div className="prose prose-slate max-w-none dark:prose-invert">
            <p className="text-base leading-8 text-foreground">
                {blocks.map((block, idx) => {
                    if (block.type === 'heading') {
                        return (
                            <span key={idx} className="block">
                                {/* Close the paragraph context, render heading, reopen */}
                                <InlineHeading text={block.heading_text ?? ''} />
                            </span>
                        )
                    }

                    if (block.type === 'line_break') {
                        return <span key={idx} className="block mt-4" />
                    }

                    if (block.type === 'verse' && block.verse) {
                        return (
                            <VerseSpan key={idx} verse={block.verse} />
                        )
                    }

                    return null
                })}
            </p>
        </div>
    )
}

function InlineHeading({ text }: { text: string }) {
    return (
        <span className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-6 mb-2 not-prose">
            {text}
        </span>
    )
}

interface VerseSpanProps {
    verse: {
        id: number
        number: number
        text: string
    }
}

function VerseSpan({ verse }: VerseSpanProps) {
    return (
        <span id={`v${verse.number}`} className="group">
            <sup className={cn('text-xs font-bold text-primary mr-0.5 select-none', 'group-hover:text-primary/70 transition-colors')}>
                {verse.number}
            </sup>
            <span className="text-foreground">
                {verse.text}{' '}
            </span>
        </span>
    )
}