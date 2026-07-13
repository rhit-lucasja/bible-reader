import React from 'react'

interface ReadLayoutProps {
    children: React.ReactNode
}

export default function ReadLayout({ children }: ReadLayoutProps) {
    return <>{children}</>
}