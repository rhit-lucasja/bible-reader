export function RelativeTime({ date }: { date: Date }) {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return <span>Just now</span>
    if (diffMins < 60) return <span>{diffMins}m ago</span>
    if (diffHours < 24) return <span>{diffHours}h ago</span>
    if (diffDays < 7) return <span>{diffDays}d ago</span>

    return (
        <span>
            {date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: diffDays > 365 ? 'numeric' : undefined,
            })}
        </span>
    )
}