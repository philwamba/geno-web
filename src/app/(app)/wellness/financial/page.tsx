'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { AppHeader } from '@/components/layout/app-header'
import { GoalCard } from '@/components/wellness/goals'
import { Button } from '@/components/ui/button'
import {
    FiDollarSign,
    FiTarget,
    FiPlus,
    FiTrendingUp,
    FiPieChart,
} from 'react-icons/fi'

export default function FinancialWellnessPage() {
    const router = useRouter()
    const { goals, fetchGoals } = useWellnessStore()

    const financialGoals = goals.filter(
        g => g.category === 'financial' && g.status === 'active',
    )

    useEffect(() => {
        fetchGoals('financial')
    }, [fetchGoals])

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppHeader
                title="Financial Wellness"
                showBack
                onBack={() => router.push('/wellness')}
            />

            <main className="p-4 space-y-4">
                {/* Hero Section */}
                <section className="rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 p-6 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                            <FiDollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                Financial Wellness
                            </h1>
                            <p className="text-sm text-white/80">
                                Track savings, budgets & goals
                            </p>
                        </div>
                    </div>
                </section>

                {/* Coming Soon Features */}
                <section className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-center text-sm font-medium text-gray-700">
                        Budget Tracking Coming Soon
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                            <FiTrendingUp className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                            <p className="text-sm font-medium text-gray-600">
                                Income Tracking
                            </p>
                            <p className="text-xs text-gray-400">Coming soon</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                            <FiPieChart className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                            <p className="text-sm font-medium text-gray-600">
                                Expense Tracking
                            </p>
                            <p className="text-xs text-gray-400">Coming soon</p>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-500">
                        For now, use goals to track your financial objectives
                    </p>
                </section>

                {/* Financial Goals */}
                <section>
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-700">
                            Financial Goals
                        </h2>
                        <button
                            onClick={() =>
                                router.push(
                                    '/wellness/goals/new?category=financial',
                                )
                            }
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            <FiPlus className="h-3 w-3" />
                            Add Goal
                        </button>
                    </div>

                    {financialGoals.length === 0 ? (
                        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
                            <FiTarget className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                            <p className="mb-2 text-sm font-medium text-gray-600">
                                No financial goals yet
                            </p>
                            <p className="mb-4 text-xs text-gray-400">
                                Set savings targets, budget limits, or income
                                goals
                            </p>
                            <Button
                                onClick={() =>
                                    router.push(
                                        '/wellness/goals/new?category=financial',
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
                            {financialGoals.map(goal => (
                                <GoalCard key={goal.id} goal={goal} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Tips */}
                <section className="rounded-xl bg-amber-50 p-4">
                    <h3 className="mb-2 text-sm font-medium text-amber-800">
                        Financial Wellness Tips
                    </h3>
                    <ul className="space-y-2 text-xs text-amber-700">
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Track your daily spending to understand your
                                habits
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Set aside 20% of income for savings and
                                investments
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Build an emergency fund covering 3-6 months of
                                expenses
                            </span>
                        </li>
                    </ul>
                </section>
            </main>
        </div>
    )
}
