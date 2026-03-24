'use client'

import { cn } from '@/lib/utils'
import type { WellnessStats } from '@/types'
import { FiStar, FiZap } from 'react-icons/fi'

interface PointsDisplayProps {
    stats: WellnessStats | null
    className?: string
    variant?: 'default' | 'compact' | 'large'
}

export function PointsDisplay({
    stats,
    className,
    variant = 'default',
}: PointsDisplayProps) {
    if (!stats) {
        return (
            <div
                className={cn(
                    'animate-pulse rounded-xl bg-gray-100 p-4',
                    className,
                )}>
                <div className="h-6 w-24 rounded bg-gray-200" />
            </div>
        )
    }

    const { total_points, level, points_to_next_level } = stats
    // Assuming each level requires 100 points
    const pointsPerLevel = 100
    const pointsEarnedInLevel = Math.max(
        0,
        pointsPerLevel - points_to_next_level,
    )
    const rawProgress =
        points_to_next_level > 0
            ? (pointsEarnedInLevel / pointsPerLevel) * 100
            : 100
    const progressToNextLevel = Math.min(100, Math.max(0, rawProgress))

    if (variant === 'compact') {
        return (
            <div
                className={cn(
                    'flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5',
                    className,
                )}>
                <FiStar className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-bold text-amber-700">
                    {total_points.toLocaleString()}
                </span>
            </div>
        )
    }

    if (variant === 'large') {
        return (
            <div
                className={cn(
                    'rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-white shadow-lg',
                    className,
                )}>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FiZap className="h-6 w-6" />
                        <span className="text-lg font-medium">
                            Wellness Points
                        </span>
                    </div>
                    <div className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                        Level {level}
                    </div>
                </div>

                <div className="mb-4 text-5xl font-bold">
                    {total_points.toLocaleString()}
                </div>

                <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="opacity-80">
                            Progress to Level {level + 1}
                        </span>
                        <span className="font-medium">
                            {points_to_next_level} points to go
                        </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/30">
                        <div
                            className="h-full rounded-full bg-white transition-all"
                            style={{ width: `${progressToNextLevel}%` }}
                        />
                    </div>
                </div>
            </div>
        )
    }

    // Default variant
    return (
        <div className={cn('rounded-xl bg-white p-4 shadow-sm', className)}>
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                        <FiStar className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Wellness Points</p>
                        <p className="text-xl font-bold text-gray-900">
                            {total_points.toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Level</p>
                    <p className="text-lg font-bold text-primary">{level}</p>
                </div>
            </div>

            <div>
                <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                    <span>Next level</span>
                    <span>{points_to_next_level} pts</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progressToNextLevel}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
