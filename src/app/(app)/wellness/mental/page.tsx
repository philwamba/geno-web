'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { AppHeader } from '@/components/layout/app-header'
import { MoodCheckInCard, MoodTrendChart } from '@/components/wellness/mood'
import { GoalCard } from '@/components/wellness/goals'
import { StreakCounter } from '@/components/wellness/gamification'
import {
    FiHeart,
    FiTarget,
    FiPlus,
    FiBook,
    FiSmile,
    FiChevronRight,
} from 'react-icons/fi'

export default function MentalWellnessPage() {
    const router = useRouter()
    const {
        goals,
        moodHistory,
        wellnessStats,
        fetchGoals,
        fetchMoodTrends,
        fetchTodayMood,
        fetchWellnessStats,
    } = useWellnessStore()

    const mentalGoals = goals.filter(
        g => g.category === 'mental' && g.status === 'active',
    )

    useEffect(() => {
        fetchGoals('mental')
        fetchMoodTrends(7)
        fetchTodayMood()
        fetchWellnessStats()
    }, [fetchGoals, fetchMoodTrends, fetchTodayMood, fetchWellnessStats])

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppHeader
                title="Mental & Emotional"
                showBack
                onBack={() => router.push('/wellness')}
            />

            <main className="p-4 space-y-4">
                {/* Hero Section */}
                <section className="rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 p-6 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                            <FiHeart className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                Mental & Emotional
                            </h1>
                            <p className="text-sm text-white/80">
                                Mood tracking, journaling & mindfulness
                            </p>
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => router.push('/wellness/mood')}
                        aria-label="Open Mood tracker"
                        className="cursor-pointer rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md text-left">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                    <FiSmile className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Mood
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Track daily
                                    </p>
                                </div>
                            </div>
                            <FiChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/wellness/journal')}
                        aria-label="Open Journal"
                        className="cursor-pointer rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md text-left">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                    <FiBook className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Journal
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Write thoughts
                                    </p>
                                </div>
                            </div>
                            <FiChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                    </button>
                </section>

                {/* Mood Check-in */}
                <section>
                    <h2 className="mb-2 text-sm font-medium text-gray-700">
                        Daily Check-in
                    </h2>
                    <MoodCheckInCard />
                </section>

                {/* Streak */}
                <section>
                    <StreakCounter stats={wellnessStats} variant="card" />
                </section>

                {/* Mood Trends */}
                {moodHistory.length > 0 && (
                    <section>
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-sm font-medium text-gray-700">
                                Weekly Mood
                            </h2>
                            <button
                                onClick={() => router.push('/wellness/mood')}
                                className="text-xs text-primary hover:underline">
                                View More
                            </button>
                        </div>
                        <MoodTrendChart moodHistory={moodHistory} days={7} />
                    </section>
                )}

                {/* Mental Goals */}
                <section>
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-700">
                            Mental Goals
                        </h2>
                        <button
                            onClick={() =>
                                router.push(
                                    '/wellness/goals/new?category=mental',
                                )
                            }
                            className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <FiPlus className="h-3 w-3" />
                            Add Goal
                        </button>
                    </div>

                    {mentalGoals.length === 0 ? (
                        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                            <FiTarget className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                            <p className="text-sm text-gray-500">
                                No mental goals yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {mentalGoals.map(goal => (
                                <GoalCard key={goal.id} goal={goal} compact />
                            ))}
                        </div>
                    )}
                </section>

                {/* Tips */}
                <section className="rounded-xl bg-purple-50 p-4">
                    <h3 className="mb-2 text-sm font-medium text-purple-800">
                        Mental Wellness Tips
                    </h3>
                    <ul className="space-y-2 text-xs text-purple-700">
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Practice daily mindfulness or meditation
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Write in your journal to process emotions
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Take regular breaks during work to refresh
                            </span>
                        </li>
                    </ul>
                </section>
            </main>
        </div>
    )
}
