'use client'

import { ChevronDown, X } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

interface Translation { 
    id: string
    english_name: string
    short_name: string
}

interface Filters {
    translation_id: string | null
    book_id: string | null
    chapter_number: number | null
}

interface BookmarkFiltersProps {
    translations: Translation[]
    filters: Filters
    onFiltersChange: (filters: Filters) => void
}

export function BookmarkFilters({
    translations,
    filters,
    onFiltersChange
}: BookmarkFiltersProps) {

    // fetch books for selected translation
    const { data: books = [] } = trpc.translation.listBooks.useQuery(
        { translation_id: filters.translation_id ?? '' },
        { enabled: !!filters.translation_id }
    )

    const selectedBook = books.find((b) => b.id === filters.book_id)

    // chapter numbers derived from selected books
    const chapters = selectedBook
        ? Array.from({ length: selectedBook.num_chapters }, (_, i) => i + 1)
        : []

    // changing a filter resets all downstream filters
    function setTranslation(id: string | null) {
        onFiltersChange({
            translation_id: id,
            book_id: null,
            chapter_number: null,
        })
    }

    function setBook(id: string | null) {
        onFiltersChange({
            ...filters,
            book_id: id,
            chapter_number: null,
        })
    }

    function setChapter(num: number | null) {
        onFiltersChange({
            ...filters,
            chapter_number: num,
        })
    }

    const hasActiveFilters =
        filters.translation_id !== null ||
        filters.book_id !== null ||
        filters.chapter_number !== null

    return (
        <div>
            <div className="flex flex-wrap gap-2 items-center">
                {/* Translation */}
                <FilterSelect
                    value={filters.translation_id ?? ''}
                    onChange={(v) => setTranslation(v || null)}
                    placeholder={"All translations"}
                    options={translations.map((t) => ({
                        value: t.id,
                        label: t.short_name,
                    }))}
                />

                {/* Book - only enabled when translation selected */}
                <FilterSelect
                    value={filters.book_id ?? ''}
                    onChange={(v) => setBook(v || null)}
                    placeholder={"All books"}
                    disabled={!filters.translation_id}
                    options={books.map((b) => ({
                        value: b.id,
                        label: b.name
                    }))}
                />

                {/* Chapter - only enabled when book is selected */}
                <FilterSelect
                    value={filters.chapter_number?.toString() ?? ''}
                    onChange={(v) => setChapter(v ? parseInt(v, 10) : null)}
                    placeholder="All chapters"
                    disabled={!filters.book_id}
                    options={chapters.map((n) => ({
                        value: n.toString(),
                        label: `Chapter ${n}`,
                    }))}
                />

                {/* Clear filters */}
                {hasActiveFilters && (
                    <button onClick={() => onFiltersChange({ translation_id: null, book_id: null, chapter_number: null })}
                        className={cn(
                            'flex items-center gap-1 text-xs px-2.5 py-1 rounded-md',
                            'text-zinc-400 dark:text-zinc-500',
                            'hover:text-zinc-600', 'dark:hover:text-zinc-300',
                            'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                            'transition-colors cursor-pointer',
                        )}
                    >
                        <X className="h-3 w-3" />
                        Clear filters
                    </button>
                )}
            </div>
        </div>
    )
}

interface FilterSelectProps {
    value: string
    onChange: (value: string) => void
    placeholder: string
    options: { value: string; label: string }[]
    disabled?: boolean
}

function FilterSelect({
    value,
    onChange,
    placeholder,
    options,
    disabled = false
}: FilterSelectProps) {
    return (
        <div className="relative">
            <select value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={cn(
                    'appearance-none pl-3 pr-8 py-1.5 rounded-lg text-sm',
                    'border border-zinc-200 dark:border-zinc-700',
                    'bg-white dark:bg-zinc-900',
                    'text-zinc-700 dark:text-zinc-300',
                    'focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500',
                    'scrollbar-track-transparent scrollbar-thumb-neutral-400',
                    'cursor-pointer transition-colors',
                    disabled && 'opacity-40 cursor-not-allowed',
                )}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
        </div>
    )
}