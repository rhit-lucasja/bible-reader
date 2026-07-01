import './globals.css';
import { TRPCProvider } from '@/lib/trpc/provider'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <TRPCProvider>
                    {children}
                </TRPCProvider>
            </body>
        </html>
    )
}