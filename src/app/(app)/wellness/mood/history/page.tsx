'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { AppHeader } from '@/components/layout/app-header'
import { MoodHistoryList } from '@/components/wellness/mood'
import { MOOD_EMOJIS, type MoodTypeValue } from '@/lib/validations/wellness'
import { FiFilter, FiX } from 'react-icons/fi'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const MOOD_COLORS: Record<MoodTypeValue, string> = {
    very_happy: '#22c55e',
    happy: '#84cc16',
    neutral: '#f59e0b',
    sad: '#6366f1',
    anxious: '#ec4899',
    tired: '#8b5cf6',
    angry: '#ef4444',
}

type DateFilter = 'all' | 'today' | 'week' | 'month'

export default function MoodHistoryPage() {
    const router = useRouter()
    const { moodHistory, fetchMoodHistory } = useWellnessStore()

    const [moodFilter, setMoodFilter] = useState<MoodTypeValue | null>(null)
    const [dateFilter, setDateFilter] = useState<DateFilter>('all')

    useEffect(() => {
        fetchMoodHistory({ per_page: 100 })
    }, [fetchMoodHistory])

    // Filter moods
    const filteredMoods = useMemo(() => {
        let filtered = [...moodHistory]

        // Apply mood filter
        if (moodFilter) {
            filtered = filtered.filter(m => m.mood === moodFilter)
        }

        // Apply date filter
        const now = new Date()
        if (dateFilter === 'today') {
            const today = now.toISOString().split('T')[0]
            filtered = filtered.filter(
                m => m.logged_date === today || m.logged_at?.startsWith(today),
            )
        } else if (dateFilter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            filtered = filtered.filter(
                m => new Date(m.logged_at || m.created_at) >= weekAgo,
            )
        } else if (dateFilter === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            filtered = filtered.filter(
                m => new Date(m.logged_at || m.created_at) >= monthAgo,
            )
        }

        return filtered
    }, [moodHistory, moodFilter, dateFilter])

    // Calculate mood distribution
    const moodDistribution = useMemo(() => {
        const counts: Record<string, number> = {}
        filteredMoods.forEach(m => {
            counts[m.mood] = (counts[m.mood] || 0) + 1
        })

        return Object.entries(counts).map(([mood, count]) => ({
            name: mood.replace('_', ' '),
            value: count,
            mood: mood as MoodTypeValue,
            emoji: MOOD_EMOJIS[mood as MoodTypeValue],
        }))
    }, [filteredMoods])

    const hasFilters = moodFilter || dateFilter !== 'all'

    const clearFilters = () => {
        setMoodFilter(null)
        setDateFilter('all')
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppHeader
                title="Mood History"
                showBack
                onBack={() => router.push('/wellness/mood')}
            />

            <main className="p-4 space-y-4">
                {/* Distribution Chart */}
                {moodDistribution.length > 0 && (
                    <section className="rounded-xl bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-sm font-medium text-gray-700">
                            Mood Distribution
                        </h2>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={moodDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {moodDistribution.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        MOOD_COLORS[entry.mood]
                                                    }
                                                />
                                            ),
                                        )}
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (!active || !payload?.[0])
                                                return null
                                            const data = payload[0].payload
                                            return (
                                                <div className="rounded-lg bg-white p-2 shadow-lg border">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">
                                                            {data.emoji}
                                                        </span>
                                                        <span className="text-sm font-medium capitalize">
                                                            {data.name}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        {data.value} entries
                                                    </p>
                                                </div>
                                            )
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                            {moodDistribution.map(item => (
                                <div
                                    key={item.mood}
                                    className="flex items-center gap-1 text-xs"
                                >
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{
                                            backgroundColor:
                                                MOOD_COLORS[item.mood],
                                        }}
                                    />
                                    <span>{item.emoji}</span>
                                    <span className="text-gray-500">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Filters */}
                <section>
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FiFilter className="h-4 w-4" />
                            Filters
                        </h2>
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                            >
                                <FiX className="h-3 w-3" />
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Mood Filter */}
                    <div className="mb-3 flex flex-wrap gap-2">
                        {(Object.keys(MOOD_EMOJIS) as MoodTypeValue[]).map(
                            mood => (
                                <button
                                    key={mood}
                                    onClick={() =>
                                        setMoodFilter(
                                            moodFilter === mood ? null : mood,
                                        )
                                    }
                                    className={cn(
                                        'flex h-9 w-9 items-center justify-center rounded-full text-lg transition-all',
                                        moodFilter === mood
                                            ? 'bg-primary/20 ring-2 ring-primary scale-110'
                                            : 'bg-gray-100 hover:bg-gray-200',
                                    )}
                                >
                                    {MOOD_EMOJIS[mood]}
                                </button>
                            ),
                        )}
                    </div>

                    {/* Date Filter */}
                    <div className="flex gap-2">
                        {(
                            [
                                { value: 'all', label: 'All Time' },
                                { value: 'today', label: 'Today' },
                                { value: 'week', label: 'This Week' },
                                { value: 'month', label: 'This Month' },
                            ] as const
                        ).map(option => (
                            <button
                                key={option.value}
                                onClick={() => setDateFilter(option.value)}
                                className={cn(
                                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                                    dateFilter === option.value
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Results */}
                <section>
                    <p className="mb-2 text-xs text-gray-500">
                        {filteredMoods.length} entries
                    </p>
                    <MoodHistoryList moods={filteredMoods} />
                </section>
            </main>
        </div>
    )
}
