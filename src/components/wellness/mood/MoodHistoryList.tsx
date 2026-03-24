'use client'

import { cn, formatRelativeTime } from '@/lib/utils'
import { MOOD_EMOJIS, type MoodTypeValue } from '@/lib/validations/wellness'
import type { MoodLog } from '@/types'

interface MoodHistoryListProps {
    moods: MoodLog[]
    className?: string
    limit?: number
    showEmpty?: boolean
}

export function MoodHistoryList({
    moods,
    className,
    limit,
    showEmpty = true,
}: MoodHistoryListProps) {
    const displayMoods = limit ? moods.slice(0, limit) : moods

    if (displayMoods.length === 0 && showEmpty) {
        return (
            <div className={cn('rounded-xl bg-white p-4 shadow-sm', className)}>
                <p className="text-center text-sm text-gray-400">
                    No mood entries yet. Start tracking your mood!
                </p>
            </div>
        )
    }

    if (displayMoods.length === 0) {
        return null
    }

    return (
        <div className={cn('rounded-xl bg-white shadow-sm', className)}>
            <div className="divide-y divide-gray-100">
                {displayMoods.map(entry => (
                    <MoodHistoryItem key={entry.id} entry={entry} />
                ))}
            </div>
        </div>
    )
}

function MoodHistoryItem({ entry }: { entry: MoodLog }) {
    const mood = entry.mood as MoodTypeValue
    const emoji = MOOD_EMOJIS[mood] || '😐'

    return (
        <div className="flex items-start gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl">
                {emoji}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize text-gray-900">
                        {mood.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                        {formatRelativeTime(
                            entry.logged_at || entry.created_at,
                        )}
                    </span>
                </div>
                {entry.note && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {entry.note}
                    </p>
                )}
            </div>
        </div>
    )
}
