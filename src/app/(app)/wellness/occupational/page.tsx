'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { AppHeader } from '@/components/layout/app-header'
import { GoalCard } from '@/components/wellness/goals'
import { Button } from '@/components/ui/button'
import {
    FiBriefcase,
    FiTarget,
    FiPlus,
    FiBook,
    FiTrendingUp,
} from 'react-icons/fi'

export default function OccupationalWellnessPage() {
    const router = useRouter()
    const { goals, fetchGoals } = useWellnessStore()

    const occupationalGoals = goals.filter(
        g => g.category === 'occupational' && g.status === 'active',
    )

    useEffect(() => {
        fetchGoals('occupational')
    }, [fetchGoals])

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppHeader
                title="Occupational Wellness"
                showBack
                onBack={() => router.push('/wellness')}
            />

            <main className="p-4 space-y-4">
                {/* Hero Section */}
                <section className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-6 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                            <FiBriefcase className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                Occupational Wellness
                            </h1>
                            <p className="text-sm text-white/80">
                                Career growth & work-life balance
                            </p>
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                                <FiBook className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Skills
                                </p>
                                <p className="text-xs text-gray-500">
                                    Track learning
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                                <FiTrendingUp className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Career
                                </p>
                                <p className="text-xs text-gray-500">
                                    Set milestones
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Occupational Goals */}
                <section>
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-700">
                            Occupational Goals
                        </h2>
                        <button
                            onClick={() =>
                                router.push(
                                    '/wellness/goals/new?category=occupational',
                                )
                            }
                            className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <FiPlus className="h-3 w-3" />
                            Add Goal
                        </button>
                    </div>

                    {occupationalGoals.length === 0 ? (
                        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
                            <FiTarget className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                            <p className="mb-2 text-sm font-medium text-gray-600">
                                No occupational goals yet
                            </p>
                            <p className="mb-4 text-xs text-gray-400">
                                Set career goals, skill targets, or work-life
                                balance objectives
                            </p>
                            <Button
                                onClick={() =>
                                    router.push(
                                        '/wellness/goals/new?category=occupational',
                                    )
                                }
                                size="sm">
                                <FiPlus className="mr-1 h-4 w-4" />
                                Create Goal
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {occupationalGoals.map(goal => (
                                <GoalCard key={goal.id} goal={goal} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Tips */}
                <section className="rounded-xl bg-orange-50 p-4">
                    <h3 className="mb-2 text-sm font-medium text-orange-800">
                        Occupational Wellness Tips
                    </h3>
                    <ul className="space-y-2 text-xs text-orange-700">
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Set clear boundaries between work and personal
                                time
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Dedicate time weekly to learning new skills
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Network with professionals in your field
                                regularly
                            </span>
                        </li>
                    </ul>
                </section>
            </main>
        </div>
    )
}
