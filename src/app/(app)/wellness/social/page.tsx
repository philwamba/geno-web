'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { wellnessApi } from '@/lib/api/client'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { GoalCard } from '@/components/wellness/goals'
import { Button } from '@/components/ui/button'
import type { WellnessMetric } from '@/types'
import {
    FiUsers,
    FiTarget,
    FiPlus,
    FiHeart,
    FiMessageCircle,
    FiCalendar,
    FiBook,
    FiCheck,
} from 'react-icons/fi'

const INTERACTION_TYPES = [
    {
        label: 'Meaningful conversation',
        value: 'conversation',
        icon: FiMessageCircle,
    },
    { label: 'Time with friends', value: 'friends', icon: FiUsers },
    { label: 'Called family', value: 'family_call', icon: FiHeart },
    { label: 'Social event', value: 'social_event', icon: FiCalendar },
] as const

export default function SocialWellnessPage() {
    const router = useRouter()
    const { goals, fetchGoals } = useWellnessStore()

    const [interactions, setInteractions] = useState<WellnessMetric[]>([])
    const [_isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const socialGoals = goals.filter(
        g => g.category === 'social' && g.status === 'active',
    )

    useEffect(() => {
        fetchGoals('social')
        loadInteractions()
    }, [fetchGoals])

    const loadInteractions = async () => {
        setIsLoading(true)
        try {
            const res = await wellnessApi.getMetrics({
                type: 'social_interaction',
            })
            setInteractions(res.metrics as WellnessMetric[])
        } catch {
            // No interactions yet
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogInteraction = async (type: string) => {
        setIsSaving(true)
        try {
            await wellnessApi.logMetric({
                metric_type: 'social_interaction',
                value: 1,
                unit: type,
            })
            toast.success('Interaction logged!')
            loadInteractions()
        } catch {
            toast.error('Failed to log interaction')
        } finally {
            setIsSaving(false)
        }
    }

    // Count interactions this week
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const thisWeekCount = interactions.filter(
        i => new Date(i.logged_at || i.created_at) >= weekStart,
    ).length

    // Count interactions today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayCount = interactions.filter(
        i => new Date(i.logged_at || i.created_at) >= todayStart,
    ).length

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
                    <div className="flex items-center gap-3 mb-4">
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

                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-white/15 p-3 text-center">
                            <p className="text-xs text-white/70">Today</p>
                            <p className="text-2xl font-bold">{todayCount}</p>
                        </div>
                        <div className="rounded-xl bg-white/15 p-3 text-center">
                            <p className="text-xs text-white/70">This Week</p>
                            <p className="text-2xl font-bold">
                                {thisWeekCount}
                            </p>
                        </div>
                        <div className="rounded-xl bg-white/15 p-3 text-center">
                            <p className="text-xs text-white/70">Total</p>
                            <p className="text-2xl font-bold">
                                {interactions.length}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Quick Log */}
                <section className="rounded-xl bg-white p-4 shadow-sm">
                    <h2 className="mb-3 text-sm font-medium text-gray-700">
                        Log an Interaction
                    </h2>
                    <div className="grid grid-cols-2 gap-2">
                        {INTERACTION_TYPES.map(type => {
                            const Icon = type.icon
                            return (
                                <button
                                    key={type.value}
                                    onClick={() =>
                                        handleLogInteraction(type.value)
                                    }
                                    disabled={isSaving}
                                    className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-3 text-left hover:bg-blue-50 hover:border-blue-200 transition-colors disabled:opacity-50">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                                        <Icon className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700">
                                        {type.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </section>

                {/* Recent Interactions */}
                {interactions.length > 0 && (
                    <section className="rounded-xl bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-sm font-medium text-gray-700">
                            Recent Interactions
                        </h2>
                        <div className="space-y-2">
                            {interactions.slice(0, 5).map((interaction, i) => {
                                const typeInfo = INTERACTION_TYPES.find(
                                    t => t.value === interaction.unit,
                                )
                                const Icon = typeInfo?.icon || FiUsers
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                                            <Icon className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {typeInfo?.label ||
                                                    interaction.unit}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(
                                                    interaction.logged_at ||
                                                        interaction.created_at,
                                                ).toLocaleDateString('en', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                        <FiCheck className="h-4 w-4 text-green-500" />
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* Connection Actions */}
                <section className="rounded-xl bg-white p-4 shadow-sm">
                    <h2 className="mb-3 text-sm font-medium text-gray-700">
                        Strengthen Connections
                    </h2>
                    <div className="space-y-2">
                        <button
                            onClick={() => router.push('/services')}
                            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                                <FiCalendar className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-gray-900">
                                    Book a Group Session
                                </p>
                                <p className="text-xs text-gray-500">
                                    Connect through shared wellness experiences
                                </p>
                            </div>
                        </button>
                        <button
                            onClick={() => router.push('/wellness/journal/new')}
                            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                <FiBook className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-gray-900">
                                    Reflect on a Connection
                                </p>
                                <p className="text-xs text-gray-500">
                                    Journal about a positive social interaction
                                </p>
                            </div>
                        </button>
                    </div>
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
                            className="flex items-center gap-1 text-xs text-primary hover:underline">
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
                                size="sm">
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
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Express gratitude to the people who matter to you
                            </span>
                        </li>
                    </ul>
                </section>
            </main>
        </div>
    )
}
