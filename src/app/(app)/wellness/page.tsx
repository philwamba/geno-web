'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { MoodCheckInCard } from '@/components/wellness/mood'
import {
    PointsDisplay,
    StreakCounter,
} from '@/components/wellness/gamification'
import { contentApi } from '@/lib/api/client'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { WellnessTip } from '@/types'
import { cn } from '@/lib/utils'
import {
    FiHeart,
    FiActivity,
    FiDollarSign,
    FiBriefcase,
    FiUsers,
    FiStar,
    FiChevronRight,
    FiSmile,
    FiBook,
    FiTarget,
} from 'react-icons/fi'

const wellnessDimensions = [
    {
        id: 'mental',
        label: 'Mental & Emotional',
        icon: FiHeart,
        color: 'bg-purple-500',
        bgLight: 'bg-purple-50',
        description:
            'Focus on your emotional health, stress management, and mental clarity.',
    },
    {
        id: 'physical',
        label: 'Physical',
        icon: FiActivity,
        color: 'bg-green-500',
        bgLight: 'bg-green-50',
        description:
            'Maintain your body through exercise, nutrition, and proper rest.',
    },
    {
        id: 'financial',
        label: 'Financial',
        icon: FiDollarSign,
        color: 'bg-yellow-500',
        bgLight: 'bg-yellow-50',
        description:
            'Build financial security and healthy money management habits.',
    },
    {
        id: 'occupational',
        label: 'Occupational',
        icon: FiBriefcase,
        color: 'bg-orange-500',
        bgLight: 'bg-orange-50',
        description: 'Find purpose and satisfaction in your work and career.',
    },
    {
        id: 'social',
        label: 'Social',
        icon: FiUsers,
        color: 'bg-blue-500',
        bgLight: 'bg-blue-50',
        description:
            'Nurture meaningful relationships and community connections.',
    },
    {
        id: 'spiritual',
        label: 'Spiritual',
        icon: FiStar,
        color: 'bg-pink-500',
        bgLight: 'bg-pink-50',
        description: 'Connect with your inner self and find meaning in life.',
    },
]

export default function WellnessPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialArea = searchParams.get('area') || 'mental'

    const [activeArea, setActiveArea] = useState(initialArea)
    const [tips, setTips] = useState<WellnessTip[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const { wellnessStats, fetchWellnessStats, fetchTodayMood } =
        useWellnessStore()

    const fetchTips = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await contentApi.getDailyTip()
            setTips(response.tip ? [response.tip as WellnessTip] : [])
        } catch (error) {
            console.error('Failed to fetch tips:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTips()
        fetchWellnessStats()
        fetchTodayMood()
    }, [fetchTips, fetchWellnessStats, fetchTodayMood])

    const activeDimension =
        wellnessDimensions.find(d => d.id === activeArea) ||
        wellnessDimensions[0]
    const ActiveIcon = activeDimension.icon

    const handleDimensionClick = () => {
        router.push(`/wellness/${activeArea}`)
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppHeader title="Wellness" showGreeting={false} />

            <main className="px-4 py-4 space-y-4">
                {/* Stats Row */}
                <section className="grid grid-cols-2 gap-3">
                    <PointsDisplay stats={wellnessStats} variant="default" />
                    <StreakCounter stats={wellnessStats} variant="card" />
                </section>

                {/* Quick Access */}
                <section className="grid grid-cols-3 gap-3">
                    <Link
                        href="/wellness/mood"
                        className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                            <FiSmile className="h-5 w-5 text-purple-500" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                            Mood
                        </span>
                    </Link>
                    <Link
                        href="/wellness/journal"
                        className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <FiBook className="h-5 w-5 text-blue-500" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                            Journal
                        </span>
                    </Link>
                    <Link
                        href="/wellness/goals"
                        className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                            <FiTarget className="h-5 w-5 text-green-500" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                            Goals
                        </span>
                    </Link>
                </section>

                {/* Daily Check-in */}
                <section>
                    <h2 className="mb-2 text-sm font-medium text-gray-700">
                        Daily Check-in
                    </h2>
                    <MoodCheckInCard compact />
                </section>

                {/* Dimension Selector */}
                <section>
                    <h2 className="mb-2 text-sm font-medium text-gray-700">
                        Wellness Dimensions
                    </h2>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {wellnessDimensions.map(dimension => {
                            const Icon = dimension.icon
                            return (
                                <button
                                    key={dimension.id}
                                    onClick={() => setActiveArea(dimension.id)}
                                    className={cn(
                                        'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 transition-colors',
                                        activeArea === dimension.id
                                            ? `${dimension.color} text-white`
                                            : 'bg-white text-gray-700 shadow-sm hover:bg-gray-50',
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        {dimension.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </section>

                {/* Active Dimension Card */}
                <section
                    onClick={handleDimensionClick}
                    className={cn(
                        'cursor-pointer rounded-2xl p-5 transition-all hover:shadow-md',
                        activeDimension.bgLight,
                    )}
                >
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    'flex h-12 w-12 items-center justify-center rounded-xl',
                                    activeDimension.color,
                                )}
                            >
                                <ActiveIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {activeDimension.label}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Tap to explore
                                </p>
                            </div>
                        </div>
                        <FiChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">
                        {activeDimension.description}
                    </p>
                </section>

                {/* All Dimensions Grid */}
                <section>
                    <h2 className="mb-3 text-sm font-medium text-gray-700">
                        All Dimensions
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {wellnessDimensions.map(dimension => {
                            const Icon = dimension.icon
                            return (
                                <Link
                                    key={dimension.id}
                                    href={`/wellness/${dimension.id}`}
                                    className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div
                                        className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-lg',
                                            dimension.color,
                                        )}
                                    >
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {dimension.label}
                                        </p>
                                    </div>
                                    <FiChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                                </Link>
                            )
                        })}
                    </div>
                </section>

                {/* Tips & Resources */}
                <section className="rounded-xl bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-medium text-gray-700">
                        Daily Tips
                    </h3>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                                    <div className="h-3 w-full rounded bg-gray-200" />
                                </div>
                            ))}
                        </div>
                    ) : tips.length === 0 ? (
                        <p className="py-4 text-center text-sm text-gray-500">
                            No tips available today
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {tips.map(tip => (
                                <Link
                                    key={tip.id}
                                    href={`/wellness/tips/${tip.id}`}
                                    className="block rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <p className="line-clamp-2 text-sm text-gray-900">
                                                {tip.content}
                                            </p>
                                            {tip.author && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    — {tip.author}
                                                </p>
                                            )}
                                        </div>
                                        <FiChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
