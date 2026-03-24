'use client'

import { useMemo } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'
import { cn } from '@/lib/utils'
import { MOOD_EMOJIS, type MoodTypeValue } from '@/lib/validations/wellness'
import type { MoodLog } from '@/types'

interface MoodTrendChartProps {
    moodHistory: MoodLog[]
    days?: 7 | 14 | 30
    className?: string
}

// Mood to numeric value for chart (higher = better mood)
const MOOD_VALUES: Record<MoodTypeValue, number> = {
    very_happy: 7,
    happy: 6,
    neutral: 5,
    sad: 3,
    anxious: 2,
    tired: 4,
    angry: 1,
}

// Mood to color mapping
const MOOD_COLORS: Record<MoodTypeValue, string> = {
    very_happy: '#22c55e',
    happy: '#84cc16',
    neutral: '#f59e0b',
    sad: '#6366f1',
    anxious: '#ec4899',
    tired: '#8b5cf6',
    angry: '#ef4444',
}

export function MoodTrendChart({
    moodHistory,
    days = 7,
    className,
}: MoodTrendChartProps) {
    const chartData = useMemo(() => {
        const today = new Date()
        const data: Array<{
            date: string
            day: string
            mood: MoodTypeValue | null
            value: number
            emoji: string
        }> = []

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            // Use local date formatting to avoid UTC timezone issues
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const dateStr = `${year}-${month}-${day}`
            const dayName = date.toLocaleDateString('en-US', {
                weekday: 'short',
            })

            const moodEntry = moodHistory.find(
                m =>
                    m.logged_date === dateStr ||
                    m.logged_at?.startsWith(dateStr),
            )

            const mood = moodEntry?.mood as MoodTypeValue | undefined

            data.push({
                date: dateStr,
                day: dayName,
                mood: mood || null,
                value: mood ? MOOD_VALUES[mood] : 0,
                emoji: mood ? MOOD_EMOJIS[mood] : '',
            })
        }

        return data
    }, [moodHistory, days])

    const CustomTooltip = ({
        active,
        payload,
    }: {
        active?: boolean
        payload?: Array<{ payload: (typeof chartData)[0] }>
    }) => {
        if (!active || !payload?.[0]) return null
        const data = payload[0].payload

        return (
            <div className="rounded-lg bg-white p-2 shadow-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900">{data.date}</p>
                {data.mood ? (
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-lg">{data.emoji}</span>
                        <span className="text-sm text-gray-600 capitalize">
                            {data.mood.replace('_', ' ')}
                        </span>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400">No mood logged</p>
                )}
            </div>
        )
    }

    const hasData = chartData.some(d => d.value > 0)

    return (
        <div className={cn('rounded-xl bg-white p-4 shadow-sm', className)}>
            <h3 className="mb-4 text-sm font-medium text-gray-700">
                Mood Trends ({days} Days)
            </h3>

            {hasData ? (
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barSize={days > 7 ? 12 : 24}>
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                            />
                            <YAxis hide domain={[0, 8]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            entry.mood
                                                ? MOOD_COLORS[entry.mood]
                                                : '#e5e7eb'
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex h-48 items-center justify-center">
                    <p className="text-sm text-gray-400">
                        No mood data for this period
                    </p>
                </div>
            )}

            {/* Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-3">
                {Object.entries(MOOD_EMOJIS)
                    .slice(0, 4)
                    .map(([mood, emoji]) => (
                        <div
                            key={mood}
                            className="flex items-center gap-1 text-xs text-gray-600"
                        >
                            <span>{emoji}</span>
                            <span className="capitalize">
                                {mood.replace('_', ' ')}
                            </span>
                        </div>
                    ))}
            </div>
        </div>
    )
}
