'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { AppHeader } from '@/components/layout/app-header'
import { GoalCard, GoalCategoryFilter } from '@/components/wellness/goals'
import { Button } from '@/components/ui/button'
import type { Goal } from '@/types'
import { type GoalCategoryValue } from '@/lib/validations/wellness'
import {
    FiPlus,
    FiTarget,
    FiCheck,
    FiChevronDown,
    FiChevronUp,
} from 'react-icons/fi'

export default function GoalsPage() {
    const router = useRouter()
    const { goals, fetchGoals, isGoalsLoading } = useWellnessStore()

    const [categoryFilter, setCategoryFilter] = useState<
        GoalCategoryValue | 'all'
    >('all')
    const [showCompleted, setShowCompleted] = useState(false)

    useEffect(() => {
        fetchGoals()
    }, [fetchGoals])

    // Filter and categorize goals
    const { activeGoals, completedGoals, categoryCounts } = useMemo(() => {
        const active: Goal[] = []
        const completed: Goal[] = []
        const counts: Record<GoalCategoryValue | 'all', number> = {
            all: 0,
            physical: 0,
            mental: 0,
            financial: 0,
            social: 0,
            occupational: 0,
            spiritual: 0,
        }

        goals.forEach(goal => {
            const category = goal.category as GoalCategoryValue
            counts.all++
            counts[category]++

            if (categoryFilter !== 'all' && goal.category !== categoryFilter) {
                return
            }

            if (goal.status === 'completed') {
                completed.push(goal)
            } else if (goal.status === 'active') {
                active.push(goal)
            }
        })

        return {
            activeGoals: active,
            completedGoals: completed,
            categoryCounts: counts,
        }
    }, [goals, categoryFilter])

    const handleNewGoal = useCallback(() => {
        const query =
            categoryFilter !== 'all' ? `?category=${categoryFilter}` : ''
        router.push(`/wellness/goals/new${query}`)
    }, [router, categoryFilter])

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppHeader
                title="Goals"
                showBack
                onBack={() => router.push('/wellness')}
                rightContent={
                    <button
                        onClick={handleNewGoal}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                        <FiPlus className="h-5 w-5" />
                    </button>
                }
            />

            <main className="p-4 space-y-4">
                {/* Quick Stats */}
                <section className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                <FiTarget className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">
                                    Active Goals
                                </p>
                                <p className="text-xl font-bold text-gray-900">
                                    {
                                        goals.filter(g => g.status === 'active')
                                            .length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                <FiCheck className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">
                                    Completed
                                </p>
                                <p className="text-xl font-bold text-gray-900">
                                    {
                                        goals.filter(
                                            g => g.status === 'completed',
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Category Filter */}
                <section>
                    <GoalCategoryFilter
                        selected={categoryFilter}
                        onSelect={setCategoryFilter}
                        counts={categoryCounts}
                    />
                </section>

                {/* Active Goals */}
                <section>
                    <h2 className="mb-2 text-sm font-medium text-gray-700">
                        Active Goals ({activeGoals.length})
                    </h2>

                    {isGoalsLoading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div
                                    key={i}
                                    className="h-32 animate-pulse rounded-xl bg-gray-200"
                                />
                            ))}
                        </div>
                    ) : activeGoals.length === 0 ? (
                        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                            <FiTarget className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                            <p className="mb-2 text-sm font-medium text-gray-600">
                                {categoryFilter !== 'all'
                                    ? `No active goals in this category`
                                    : 'No active goals yet'}
                            </p>
                            <p className="mb-4 text-xs text-gray-400">
                                Set a goal to start tracking your progress
                            </p>
                            <Button onClick={handleNewGoal} size="sm">
                                <FiPlus className="mr-1 h-4 w-4" />
                                Create Goal
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeGoals.map(goal => (
                                <GoalCard key={goal.id} goal={goal} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Completed Goals (Collapsible) */}
                {completedGoals.length > 0 && (
                    <section>
                        <button
                            onClick={() => setShowCompleted(!showCompleted)}
                            className="mb-2 flex w-full items-center justify-between text-sm font-medium text-gray-700">
                            <span>
                                Completed Goals ({completedGoals.length})
                            </span>
                            {showCompleted ? (
                                <FiChevronUp className="h-4 w-4" />
                            ) : (
                                <FiChevronDown className="h-4 w-4" />
                            )}
                        </button>

                        {showCompleted && (
                            <div className="space-y-3">
                                {completedGoals.map(goal => (
                                    <GoalCard
                                        key={goal.id}
                                        goal={goal}
                                        compact
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    )
}
