'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { GoalCard } from '@/components/wellness/goals'
import { Button } from '@/components/ui/button'
import {
    FiStar,
    FiTarget,
    FiPlus,
    FiHeart,
    FiPlay,
    FiPause,
    FiRefreshCw,
} from 'react-icons/fi'

export default function SpiritualWellnessPage() {
    const router = useRouter()
    const { goals, fetchGoals, createJournalEntry, isJournalLoading } =
        useWellnessStore()

    const spiritualGoals = goals.filter(
        g => g.category === 'spiritual' && g.status === 'active',
    )

    // Meditation timer state
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [timerSeconds, setTimerSeconds] = useState(5 * 60) // 5 minutes default
    const [selectedDuration, setSelectedDuration] = useState(5)

    // Gratitude form
    const [showGratitudeForm, setShowGratitudeForm] = useState(false)
    const [gratitude1, setGratitude1] = useState('')
    const [gratitude2, setGratitude2] = useState('')
    const [gratitude3, setGratitude3] = useState('')

    useEffect(() => {
        fetchGoals('spiritual')
    }, [fetchGoals])

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (isTimerRunning && timerSeconds > 0) {
            interval = setInterval(() => {
                setTimerSeconds(s => s - 1)
            }, 1000)
        } else if (timerSeconds === 0) {
            setIsTimerRunning(false)
            toast.success('Meditation complete! Great job.')
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isTimerRunning, timerSeconds])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleDurationChange = (minutes: number) => {
        setSelectedDuration(minutes)
        setTimerSeconds(minutes * 60)
        setIsTimerRunning(false)
    }

    const handleTimerToggle = () => {
        setIsTimerRunning(!isTimerRunning)
    }

    const handleTimerReset = () => {
        setTimerSeconds(selectedDuration * 60)
        setIsTimerRunning(false)
    }

    const handleSaveGratitude = useCallback(async () => {
        const entries = [gratitude1, gratitude2, gratitude3].filter(Boolean)
        if (entries.length === 0) {
            toast.error('Please enter at least one thing you are grateful for')
            return
        }

        const content = `Today I am grateful for:\n\n1. ${gratitude1 || '-'}\n2. ${gratitude2 || '-'}\n3. ${gratitude3 || '-'}`

        try {
            await createJournalEntry(content, undefined, [
                'gratitude',
                'spiritual',
            ])
            toast.success('Gratitude logged! +3 points')
            setGratitude1('')
            setGratitude2('')
            setGratitude3('')
            setShowGratitudeForm(false)
        } catch {
            toast.error('Failed to save gratitude entry')
        }
    }, [gratitude1, gratitude2, gratitude3, createJournalEntry])

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppHeader
                title="Spiritual Wellness"
                showBack
                onBack={() => router.push('/wellness')}
            />

            <main className="p-4 space-y-4">
                {/* Hero Section */}
                <section className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                            <FiStar className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                Spiritual Wellness
                            </h1>
                            <p className="text-sm text-white/80">
                                Meditation, gratitude & inner peace
                            </p>
                        </div>
                    </div>
                </section>

                {/* Meditation Timer */}
                <section className="rounded-xl bg-white p-4 shadow-sm">
                    <h2 className="mb-4 text-sm font-medium text-gray-700">
                        Meditation Timer
                    </h2>

                    {/* Duration Selection */}
                    <div className="mb-4 flex justify-center gap-2">
                        {[3, 5, 10, 15, 20].map(mins => (
                            <button
                                key={mins}
                                onClick={() => handleDurationChange(mins)}
                                className={cn(
                                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                                    selectedDuration === mins
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                                )}
                            >
                                {mins}m
                            </button>
                        ))}
                    </div>

                    {/* Timer Display */}
                    <div className="mb-4 text-center">
                        <div
                            className={cn(
                                'inline-flex h-32 w-32 items-center justify-center rounded-full',
                                isTimerRunning
                                    ? 'bg-primary/10 ring-4 ring-primary/30'
                                    : 'bg-gray-100',
                            )}
                        >
                            <span className="text-4xl font-bold text-gray-900">
                                {formatTime(timerSeconds)}
                            </span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={handleTimerReset}
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                            <FiRefreshCw className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleTimerToggle}
                            className={cn(
                                'flex h-14 w-14 items-center justify-center rounded-full text-white transition-colors',
                                isTimerRunning
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-primary hover:bg-primary/90',
                            )}
                        >
                            {isTimerRunning ? (
                                <FiPause className="h-6 w-6" />
                            ) : (
                                <FiPlay className="ml-1 h-6 w-6" />
                            )}
                        </button>
                    </div>
                </section>

                {/* Gratitude Log */}
                <section className="rounded-xl bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-700">
                            Daily Gratitude
                        </h2>
                        <button
                            onClick={() =>
                                setShowGratitudeForm(!showGratitudeForm)
                            }
                            className="text-xs text-primary hover:underline"
                        >
                            {showGratitudeForm ? 'Cancel' : 'Log Today'}
                        </button>
                    </div>

                    {showGratitudeForm ? (
                        <div className="space-y-3">
                            <p className="text-xs text-gray-500">
                                What are 3 things you&apos;re grateful for
                                today?
                            </p>
                            {[
                                { value: gratitude1, setter: setGratitude1 },
                                { value: gratitude2, setter: setGratitude2 },
                                { value: gratitude3, setter: setGratitude3 },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2"
                                >
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100">
                                        <FiHeart className="h-3 w-3 text-pink-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={item.value}
                                        onChange={e =>
                                            item.setter(e.target.value)
                                        }
                                        placeholder={`Gratitude ${index + 1}`}
                                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            ))}
                            <Button
                                onClick={handleSaveGratitude}
                                disabled={isJournalLoading}
                                size="sm"
                                className="w-full"
                            >
                                Save Gratitude
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 rounded-lg bg-pink-50 p-3">
                            <FiHeart className="h-5 w-5 text-pink-500" />
                            <p className="text-sm text-pink-700">
                                Practicing gratitude daily improves mental
                                health and well-being
                            </p>
                        </div>
                    )}
                </section>

                {/* Spiritual Goals */}
                <section>
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-700">
                            Spiritual Goals
                        </h2>
                        <button
                            onClick={() =>
                                router.push(
                                    '/wellness/goals/new?category=spiritual',
                                )
                            }
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            <FiPlus className="h-3 w-3" />
                            Add Goal
                        </button>
                    </div>

                    {spiritualGoals.length === 0 ? (
                        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                            <FiTarget className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                            <p className="text-sm text-gray-500">
                                No spiritual goals yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {spiritualGoals.map(goal => (
                                <GoalCard key={goal.id} goal={goal} compact />
                            ))}
                        </div>
                    )}
                </section>

                {/* Tips */}
                <section className="rounded-xl bg-pink-50 p-4">
                    <h3 className="mb-2 text-sm font-medium text-pink-800">
                        Spiritual Wellness Tips
                    </h3>
                    <ul className="space-y-2 text-xs text-pink-700">
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Start with just 3 minutes of meditation daily
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Keep a gratitude journal to shift your
                                perspective
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Spend time in nature to reconnect with yourself
                            </span>
                        </li>
                    </ul>
                </section>
            </main>
        </div>
    )
}
