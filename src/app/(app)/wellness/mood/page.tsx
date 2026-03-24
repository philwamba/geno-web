'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { AppHeader } from '@/components/layout/app-header'
import {
    MoodCheckInCard,
    MoodTrendChart,
    MoodCalendar,
    MoodHistoryList,
} from '@/components/wellness/mood'
import { StreakCounter } from '@/components/wellness/gamification'
import {
    FiCalendar,
    FiBarChart2,
    FiClock,
    FiChevronRight,
} from 'react-icons/fi'

type ViewMode = 'chart' | 'calendar'

export default function MoodPage() {
    const router = useRouter()
    const {
        moodHistory,
        wellnessStats,
        fetchTodayMood,
        fetchMoodTrends,
        fetchMoodHistory,
        fetchWellnessStats,
    } = useWellnessStore()

    const [viewMode, setViewMode] = useState<ViewMode>('chart')
    const [chartDays, setChartDays] = useState<7 | 14 | 30>(7)

    useEffect(() => {
        fetchTodayMood()
        fetchMoodTrends(30)
        fetchMoodHistory({ per_page: 100 })
        fetchWellnessStats()
    }, [fetchTodayMood, fetchMoodTrends, fetchMoodHistory, fetchWellnessStats])

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppHeader
                title="Mood Tracking"
                showBack
                onBack={() => router.push('/wellness')}
            />

            <main className="p-4 space-y-4">
                {/* Daily Check-in */}
                <section>
                    <h2 className="mb-2 text-sm font-medium text-gray-700">
                        Daily Check-in
                    </h2>
                    <MoodCheckInCard />
                </section>

                {/* Quick Stats */}
                <section className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                        <StreakCounter
                            stats={wellnessStats}
                            variant="default"
                        />
                    </div>
                    <div
                        className="cursor-pointer rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                        onClick={() => router.push('/wellness/mood/history')}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                    <FiClock className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Total Entries
                                    </p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {moodHistory.length}
                                    </p>
                                </div>
                            </div>
                            <FiChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </section>

                {/* View Toggle */}
                <section>
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-700">
                            Mood Overview
                        </h2>
                        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                            <button
                                onClick={() => setViewMode('chart')}
                                className={cn(
                                    'flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors',
                                    viewMode === 'chart'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700',
                                )}>
                                <FiBarChart2 className="h-3 w-3" />
                                Chart
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={cn(
                                    'flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors',
                                    viewMode === 'calendar'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700',
                                )}>
                                <FiCalendar className="h-3 w-3" />
                                Calendar
                            </button>
                        </div>
                    </div>
                </section>

                {/* Trend View */}
                {viewMode === 'chart' && (
                    <section>
                        <div className="mb-3 flex justify-center gap-2">
                            {([7, 14, 30] as const).map(days => (
                                <button
                                    key={days}
                                    onClick={() => setChartDays(days)}
                                    className={cn(
                                        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                                        chartDays === days
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                                    )}>
                                    {days} Days
                                </button>
                            ))}
                        </div>
                        <MoodTrendChart
                            moodHistory={moodHistory}
                            days={chartDays}
                        />
                    </section>
                )}

                {/* Calendar View */}
                {viewMode === 'calendar' && (
                    <section>
                        <MoodCalendar moodHistory={moodHistory} />
                    </section>
                )}

                {/* Recent History */}
                <section>
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-700">
                            Recent Entries
                        </h2>
                        <button
                            onClick={() =>
                                router.push('/wellness/mood/history')
                            }
                            className="text-xs text-primary hover:underline">
                            View All
                        </button>
                    </div>
                    <MoodHistoryList moods={moodHistory} limit={5} />
                </section>
            </main>
        </div>
    )
}
