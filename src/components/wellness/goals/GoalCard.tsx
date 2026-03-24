'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn, formatDate } from '@/lib/utils'
import {
    GOAL_CATEGORY_COLORS,
    type GoalCategoryValue,
    type GoalStatusValue,
} from '@/lib/validations/wellness'
import type { Goal } from '@/types'
import { FiCalendar, FiCheck } from 'react-icons/fi'

interface GoalCardProps {
    goal: Goal
    className?: string
    onClick?: () => void
    compact?: boolean
}

const STATUS_STYLES: Record<
    GoalStatusValue,
    { bg: string; text: string; label: string }
> = {
    active: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Active' },
    completed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Completed',
    },
    paused: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Paused' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' },
}

const CATEGORY_LABELS: Record<GoalCategoryValue, string> = {
    physical: 'Physical',
    mental: 'Mental',
    financial: 'Financial',
    social: 'Social',
    occupational: 'Occupational',
    spiritual: 'Spiritual',
}

export function GoalCard({
    goal,
    className,
    onClick,
    compact = false,
}: GoalCardProps) {
    const router = useRouter()
    const category = goal.category as GoalCategoryValue
    const status = goal.status as GoalStatusValue
    const statusStyle = STATUS_STYLES[status]
    const categoryColor = GOAL_CATEGORY_COLORS[category]
    const progress = goal.progress_percentage || 0
    const isOverdue = goal.is_overdue

    const handleClick = useCallback(() => {
        if (onClick) {
            onClick()
        } else {
            router.push(`/wellness/goals/${goal.id}`)
        }
    }, [onClick, router, goal.id])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                e.preventDefault()
                handleClick()
            }
        },
        [handleClick],
    )

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={cn(
                'cursor-pointer rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isOverdue && status === 'active' && 'ring-2 ring-red-200',
                className,
            )}
        >
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    {/* Category indicator */}
                    <div
                        className={cn('h-3 w-3 rounded-full', categoryColor)}
                    />
                    <span className="text-xs text-gray-500">
                        {CATEGORY_LABELS[category]}
                    </span>
                </div>
                <span
                    className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        statusStyle.bg,
                        statusStyle.text,
                    )}
                >
                    {statusStyle.label}
                </span>
            </div>

            {/* Title & Description */}
            <h3 className="mb-1 font-medium text-gray-900 line-clamp-1">
                {goal.title}
            </h3>
            {!compact && goal.description && (
                <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                    {goal.description}
                </p>
            )}

            {/* Progress Bar */}
            {goal.target_value && (
                <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">
                            {goal.current_value || 0} / {goal.target_value}{' '}
                            {goal.unit}
                        </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all',
                                progress >= 100
                                    ? 'bg-green-500'
                                    : isOverdue
                                      ? 'bg-red-500'
                                      : 'bg-primary',
                            )}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                    <div className="mt-1 text-right text-xs font-medium text-gray-500">
                        {Math.round(progress)}%
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                {goal.target_date && (
                    <div
                        className={cn(
                            'flex items-center gap-1',
                            isOverdue && status === 'active' && 'text-red-500',
                        )}
                    >
                        <FiCalendar className="h-3 w-3" />
                        <span>
                            {isOverdue ? 'Overdue: ' : 'Due: '}
                            {formatDate(goal.target_date)}
                        </span>
                    </div>
                )}
                {status === 'completed' && goal.completed_at && (
                    <div className="flex items-center gap-1 text-green-600">
                        <FiCheck className="h-3 w-3" />
                        <span>Completed {formatDate(goal.completed_at)}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
