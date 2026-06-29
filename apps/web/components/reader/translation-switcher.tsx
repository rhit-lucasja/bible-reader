'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

interface TranslationSwitcherProps {
    currentTranslation: string
}

export function TranslationSwitcher({ currentTranslation }: TranslationSwitcherProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { data: translations } = trpc.translation.listTranslations.useQuery()

    const current = translations?.find((t) => t.id === currentTranslation)

    function switchTranslation(translation_id: string) {
        const url = new URL(pathname, window.location.origin)
        url.searchParams.set('translation', translation_id)
        router.push(url.pathname + url.search)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    {current?.short_name ?? currentTranslation}
                    <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {translations?.map((t) => (
                    <DropdownMenuItem key={t.id} onClick={() => switchTranslation(t.id)} className={t.id === currentTranslation ? 'font-medium' : ''}>
                        <span className="mr-2 text-muted-foreground text-xs w-10">
                            {t.short_name}
                        </span>
                        {t.english_name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}