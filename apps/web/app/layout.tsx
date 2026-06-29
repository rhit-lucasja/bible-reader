import { TRPCProvider } from '@/lib/trpc/provider'
import { JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});


export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={cn("font-mono", jetbrainsMono.variable)}>
            <body>
                <TRPCProvider>
                    {children}
                </TRPCProvider>
            </body>
        </html>
    )
}