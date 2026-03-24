'use client'

import { cn } from '@/lib/utils'
import type { WellnessStats } from '@/types'
import { FiZap, FiTrendingUp, FiAward } from 'react-icons/fi'

interface StreakCounterProps {
    stats: WellnessStats | null
    className?: string
    variant?: 'default' | 'compact' | 'card'
}

export function StreakCounter({
    stats,
    className,
    variant = 'default',
}: StreakCounterProps) {
    if (!stats) {
        return (
            <div
                className={cn(
                    'animate-pulse rounded-xl bg-gray-100 p-4',
                    className,
                )}>
                <div className="h-6 w-16 rounded bg-gray-200" />
            </div>
        )
    }

    const { current_streak, longest_streak } = stats
    const isOnFire = current_streak >= 7
    const isNewRecord = current_streak === longest_streak && current_streak > 0

    if (variant === 'compact') {
        return (
            <div
                className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5',
                    isOnFire ? 'bg-orange-100' : 'bg-blue-100',
                    className,
                )}>
                <FiZap
                    className={cn(
                        'h-4 w-4',
                        isOnFire ? 'text-orange-500' : 'text-blue-500',
                    )}
                />
                <span
                    className={cn(
                        'text-sm font-bold',
                        isOnFire ? 'text-orange-700' : 'text-blue-700',
                    )}>
                    {current_streak} day{current_streak !== 1 ? 's' : ''}
                </span>
            </div>
        )
    }

    if (variant === 'card') {
        return (
            <div
                className={cn(
                    'rounded-xl p-4 shadow-sm',
                    isOnFire
                        ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                        : 'bg-white',
                    className,
                )}>
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-full',
                                isOnFire ? 'bg-white/20' : 'bg-orange-100',
                            )}>
                            <FiZap
                                className={cn(
                                    'h-5 w-5',
                                    isOnFire ? 'text-white' : 'text-orange-500',
                                )}
                            />
                        </div>
                        <div>
                            <p
                                className={cn(
                                    'text-xs',
                                    isOnFire
                                        ? 'text-white/80'
                                        : 'text-gray-500',
                                )}>
                                Current Streak
                            </p>
                            <p
                                className={cn(
                                    'text-xl font-bold',
                                    isOnFire ? 'text-white' : 'text-gray-900',
                                )}>
                                {current_streak} day
                                {current_streak !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    {isNewRecord && current_streak > 1 && (
                        <div
                            className={cn(
                                'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                                isOnFire
                                    ? 'bg-white/20 text-white'
                                    : 'bg-primary/10 text-primary',
                            )}>
                            <FiAward className="h-3 w-3" />
                            New Record!
                        </div>
                    )}
                </div>

                <div
                    className={cn(
                        'flex items-center justify-between text-sm',
                        isOnFire ? 'text-white/80' : 'text-gray-500',
                    )}>
                    <div className="flex items-center gap-1">
                        <FiTrendingUp className="h-4 w-4" />
                        <span>Longest: {longest_streak} days</span>
                    </div>
                    {isOnFire && (
                        <span className="font-medium">
                            You&apos;re on fire!
                        </span>
                    )}
                </div>
            </div>
        )
    }

    // Default variant
    return (
        <div className={cn('flex items-center gap-3', className)}>
            <div
                className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full',
                    isOnFire
                        ? 'bg-gradient-to-br from-orange-500 to-red-500'
                        : 'bg-blue-100',
                )}>
                <FiZap
                    className={cn(
                        'h-6 w-6',
                        isOnFire ? 'text-white' : 'text-blue-500',
                    )}
                />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                        {current_streak}
                    </span>
                    <span className="text-sm text-gray-500">
                        day{current_streak !== 1 ? 's' : ''}
                    </span>
                    {isNewRecord && current_streak > 1 && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Best!
                        </span>
                    )}
                </div>
                <p className="text-xs text-gray-500">
                    Longest: {longest_streak} days
                </p>
            </div>
        </div>
    )
}
