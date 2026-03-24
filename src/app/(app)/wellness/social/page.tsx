'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { AppHeader } from '@/components/layout/app-header'
import { GoalCard } from '@/components/wellness/goals'
import { Button } from '@/components/ui/button'
import {
    FiUsers,
    FiTarget,
    FiPlus,
    FiMessageCircle,
    FiUserPlus,
} from 'react-icons/fi'

export default function SocialWellnessPage() {
    const router = useRouter()
    const { goals, fetchGoals } = useWellnessStore()

    const socialGoals = goals.filter(
        g => g.category === 'social' && g.status === 'active',
    )

    useEffect(() => {
        fetchGoals('social')
    }, [fetchGoals])

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppHeader
                title="Social Wellness"
                showBack
                onBack={() => router.push('/wellness')}
            />

            <main className="p-4 space-y-4">
                {/* Hero Section */}
                <section className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                            <FiUsers className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                Social Wellness
                            </h1>
                            <p className="text-sm text-white/80">
                                Relationships, community & connection
                            </p>
                        </div>
                    </div>
                </section>

                {/* Coming Soon Features */}
                <section className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-center text-sm font-medium text-gray-700">
                        Community Features Coming Soon
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                            <FiMessageCircle className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                            <p className="text-sm font-medium text-gray-600">
                                Group Challenges
                            </p>
                            <p className="text-xs text-gray-400">Coming soon</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                            <FiUserPlus className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                            <p className="text-sm font-medium text-gray-600">
                                Accountability Partners
                            </p>
                            <p className="text-xs text-gray-400">Coming soon</p>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-500">
                        For now, use goals to track your social objectives
                    </p>
                </section>

                {/* Social Goals */}
                <section>
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-700">
                            Social Goals
                        </h2>
                        <button
                            onClick={() =>
                                router.push(
                                    '/wellness/goals/new?category=social',
                                )
                            }
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            <FiPlus className="h-3 w-3" />
                            Add Goal
                        </button>
                    </div>

                    {socialGoals.length === 0 ? (
                        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
                            <FiTarget className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                            <p className="mb-2 text-sm font-medium text-gray-600">
                                No social goals yet
                            </p>
                            <p className="mb-4 text-xs text-gray-400">
                                Set goals for relationships, networking, or
                                community involvement
                            </p>
                            <Button
                                onClick={() =>
                                    router.push(
                                        '/wellness/goals/new?category=social',
                                    )
                                }
                                size="sm"
                            >
                                <FiPlus className="mr-1 h-4 w-4" />
                                Create Goal
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {socialGoals.map(goal => (
                                <GoalCard key={goal.id} goal={goal} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Tips */}
                <section className="rounded-xl bg-blue-50 p-4">
                    <h3 className="mb-2 text-sm font-medium text-blue-800">
                        Social Wellness Tips
                    </h3>
                    <ul className="space-y-2 text-xs text-blue-700">
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Schedule regular catch-ups with friends and
                                family
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Join clubs or groups aligned with your interests
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Practice active listening to deepen connections
                            </span>
                        </li>
                    </ul>
                </section>
            </main>
        </div>
    )
}
