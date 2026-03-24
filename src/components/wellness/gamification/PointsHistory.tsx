'use client'

import { cn, formatRelativeTime } from '@/lib/utils'
import type { WellnessPoint } from '@/types'
import { FiPlus, FiZap } from 'react-icons/fi'

interface PointsHistoryProps {
    points: WellnessPoint[]
    className?: string
    limit?: number
}

// Activity type to friendly name
const ACTIVITY_LABELS: Record<string, string> = {
    mood_log: 'Mood Check-in',
    journal_entry: 'Journal Entry',
    goal_complete: 'Goal Completed',
    goal_progress: 'Goal Progress',
    session_complete: 'Session Completed',
    daily_login: 'Daily Login',
    streak_bonus: 'Streak Bonus',
    first_mood: 'First Mood Log',
    first_journal: 'First Journal Entry',
    first_goal: 'First Goal Created',
}

// Activity type to icon color
const ACTIVITY_COLORS: Record<string, string> = {
    mood_log: 'bg-purple-100 text-purple-500',
    journal_entry: 'bg-blue-100 text-blue-500',
    goal_complete: 'bg-green-100 text-green-500',
    goal_progress: 'bg-emerald-100 text-emerald-500',
    session_complete: 'bg-orange-100 text-orange-500',
    daily_login: 'bg-amber-100 text-amber-500',
    streak_bonus: 'bg-red-100 text-red-500',
}

export function PointsHistory({
    points,
    className,
    limit,
}: PointsHistoryProps) {
    const displayPoints = limit ? points.slice(0, limit) : points

    if (displayPoints.length === 0) {
        return (
            <div className={cn('rounded-xl bg-white p-4 shadow-sm', className)}>
                <p className="text-center text-sm text-gray-400">
                    No points history yet. Start tracking your wellness!
                </p>
            </div>
        )
    }

    return (
        <div className={cn('rounded-xl bg-white shadow-sm', className)}>
            <div className="divide-y divide-gray-100">
                {displayPoints.map(point => (
                    <PointHistoryItem key={point.id} point={point} />
                ))}
            </div>
        </div>
    )
}

function PointHistoryItem({ point }: { point: WellnessPoint }) {
    const activityLabel =
        ACTIVITY_LABELS[point.activity_type] || point.activity_type
    const colorClass =
        ACTIVITY_COLORS[point.activity_type] || 'bg-gray-100 text-gray-500'

    return (
        <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        colorClass,
                    )}>
                    <FiZap className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900">
                        {point.description || activityLabel}
                    </p>
                    <p className="text-xs text-gray-500">
                        {formatRelativeTime(point.created_at)}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1">
                <FiPlus className="h-3 w-3 text-primary" />
                <span className="text-sm font-bold text-primary">
                    {point.points}
                </span>
            </div>
        </div>
    )
}
