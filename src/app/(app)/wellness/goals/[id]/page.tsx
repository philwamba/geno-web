'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { cn, formatDate } from '@/lib/utils'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { GoalProgressTracker } from '@/components/wellness/goals'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    GOAL_CATEGORY_COLORS,
    type GoalCategoryValue,
    type GoalStatusValue,
} from '@/lib/validations/wellness'
import type { Goal } from '@/types'
import { FiCalendar, FiTrendingUp, FiCheck, FiTarget } from 'react-icons/fi'

const CATEGORY_LABELS: Record<GoalCategoryValue, string> = {
    physical: 'Physical',
    mental: 'Mental',
    financial: 'Financial',
    social: 'Social',
    occupational: 'Occupational',
    spiritual: 'Spiritual',
}

const STATUS_LABELS: Record<GoalStatusValue, string> = {
    active: 'Active',
    completed: 'Completed',
    paused: 'Paused',
    cancelled: 'Cancelled',
}

export default function GoalDetailPage() {
    const router = useRouter()
    const params = useParams()
    const { goals, fetchGoals, completeGoal, isGoalsLoading } =
        useWellnessStore()

    const goalId = Number(params.id)

    const [goal, setGoal] = useState<Goal | null>(null)
    const [showProgressTracker, setShowProgressTracker] = useState(false)
    const [showCompleteDialog, setShowCompleteDialog] = useState(false)

    useEffect(() => {
        if (goals.length === 0) {
            fetchGoals()
        }
    }, [goals.length, fetchGoals])

    useEffect(() => {
        const found = goals.find(g => g.id === goalId)
        setGoal(found || null)
    }, [goals, goalId])

    const handleComplete = useCallback(async () => {
        try {
            await completeGoal(goalId)
            toast.success('Goal completed! Great job!')
            setShowCompleteDialog(false)
            fetchGoals()
        } catch {
            toast.error('Failed to complete goal')
        }
    }, [completeGoal, goalId, fetchGoals])

    if (!goal && !isGoalsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <AppHeader
                    title="Goal"
                    showBack
                    onBack={() => router.push('/wellness/goals')}
                />
                <main className="flex h-64 items-center justify-center p-4">
                    <p className="text-gray-500">Goal not found</p>
                </main>
            </div>
        )
    }

    if (!goal) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <AppHeader
                    title="Goal"
                    showBack
                    onBack={() => router.push('/wellness/goals')}
                />
                <main className="p-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 w-48 rounded bg-gray-200" />
                        <div className="h-32 rounded-xl bg-gray-200" />
                    </div>
                </main>
            </div>
        )
    }

    const category = goal.category as GoalCategoryValue
    const status = goal.status as GoalStatusValue
    const progress = goal.progress_percentage || 0
    const isActive = status === 'active'
    const isOverdue = goal.is_overdue && isActive

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppHeader
                title="Goal Details"
                showBack
                onBack={() => router.push('/wellness/goals')}
            />

            <main className="p-4 space-y-4">
                {/* Goal Header */}
                <section className="rounded-xl bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                        <div
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-full text-white',
                                GOAL_CATEGORY_COLORS[category],
                            )}
                        >
                            <FiTarget className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">
                                {CATEGORY_LABELS[category]}
                            </span>
                            <span
                                className={cn(
                                    'ml-2 rounded-full px-2 py-0.5 text-xs font-medium',
                                    status === 'active' &&
                                        'bg-blue-100 text-blue-700',
                                    status === 'completed' &&
                                        'bg-green-100 text-green-700',
                                    status === 'paused' &&
                                        'bg-yellow-100 text-yellow-700',
                                    status === 'cancelled' &&
                                        'bg-gray-100 text-gray-700',
                                )}
                            >
                                {STATUS_LABELS[status]}
                            </span>
                        </div>
                    </div>

                    <h1 className="mb-2 text-xl font-bold text-gray-900">
                        {goal.title}
                    </h1>

                    {goal.description && (
                        <p className="mb-4 text-sm text-gray-600">
                            {goal.description}
                        </p>
                    )}

                    {/* Dates */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {goal.start_date && (
                            <div className="flex items-center gap-1">
                                <FiCalendar className="h-4 w-4" />
                                <span>
                                    Started: {formatDate(goal.start_date)}
                                </span>
                            </div>
                        )}
                        {goal.target_date && (
                            <div
                                className={cn(
                                    'flex items-center gap-1',
                                    isOverdue && 'text-red-500',
                                )}
                            >
                                <FiCalendar className="h-4 w-4" />
                                <span>
                                    {isOverdue ? 'Overdue: ' : 'Due: '}
                                    {formatDate(goal.target_date)}
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Progress Section */}
                {goal.target_value && (
                    <section className="rounded-xl bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-sm font-medium text-gray-700">
                            Progress
                        </h2>

                        <div className="mb-4">
                            <div className="mb-2 flex items-end justify-between">
                                <div>
                                    <span className="text-3xl font-bold text-gray-900">
                                        {goal.current_value || 0}
                                    </span>
                                    <span className="text-lg text-gray-500">
                                        {' '}
                                        / {goal.target_value} {goal.unit}
                                    </span>
                                </div>
                                <span
                                    className={cn(
                                        'text-lg font-bold',
                                        progress >= 100
                                            ? 'text-green-500'
                                            : isOverdue
                                              ? 'text-red-500'
                                              : 'text-primary',
                                    )}
                                >
                                    {Math.round(progress)}%
                                </span>
                            </div>

                            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all',
                                        progress >= 100
                                            ? 'bg-green-500'
                                            : isOverdue
                                              ? 'bg-red-500'
                                              : 'bg-primary',
                                    )}
                                    style={{
                                        width: `${Math.min(progress, 100)}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {isActive && (
                            <Button
                                onClick={() => setShowProgressTracker(true)}
                                className="w-full"
                            >
                                <FiTrendingUp className="mr-2 h-4 w-4" />
                                Update Progress
                            </Button>
                        )}
                    </section>
                )}

                {/* Actions */}
                {isActive && (
                    <section className="flex gap-2">
                        <Button
                            onClick={() => setShowCompleteDialog(true)}
                            variant="outline"
                            className="flex-1 text-green-600 hover:bg-green-50"
                        >
                            <FiCheck className="mr-2 h-4 w-4" />
                            Complete
                        </Button>
                    </section>
                )}

                {/* Completed Info */}
                {status === 'completed' && goal.completed_at && (
                    <section className="rounded-xl bg-green-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
                                <FiCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-medium text-green-800">
                                    Goal Completed!
                                </p>
                                <p className="text-sm text-green-600">
                                    Completed on {formatDate(goal.completed_at)}
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* Progress Tracker Modal */}
            {goal.target_value && (
                <GoalProgressTracker
                    goal={goal}
                    open={showProgressTracker}
                    onOpenChange={setShowProgressTracker}
                    onSuccess={() => fetchGoals()}
                />
            )}

            {/* Complete Confirmation */}
            <AlertDialog
                open={showCompleteDialog}
                onOpenChange={setShowCompleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Complete Goal</AlertDialogTitle>
                        <AlertDialogDescription>
                            Mark &quot;{goal.title}&quot; as completed? This
                            will record your achievement.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleComplete}
                            disabled={isGoalsLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <FiCheck className="mr-2 h-4 w-4" />
                            Complete Goal
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
