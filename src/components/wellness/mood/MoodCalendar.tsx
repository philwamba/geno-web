'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { MOOD_EMOJIS, type MoodTypeValue } from '@/lib/validations/wellness'
import type { MoodLog } from '@/types'

interface MoodCalendarProps {
    moodHistory: MoodLog[]
    className?: string
    month?: Date
}

const MOOD_BG_COLORS: Record<MoodTypeValue, string> = {
    very_happy: 'bg-green-500',
    happy: 'bg-lime-500',
    neutral: 'bg-amber-500',
    sad: 'bg-indigo-500',
    anxious: 'bg-pink-500',
    tired: 'bg-violet-500',
    angry: 'bg-red-500',
}

export function MoodCalendar({
    moodHistory,
    className,
    month,
}: MoodCalendarProps) {
    const currentMonth = useMemo(() => month || new Date(), [month])

    const calendarData = useMemo(() => {
        const year = currentMonth.getFullYear()
        const monthIndex = currentMonth.getMonth()

        // First day of month and number of days
        const firstDay = new Date(year, monthIndex, 1)
        const lastDay = new Date(year, monthIndex + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startDayOfWeek = firstDay.getDay()

        // Create mood lookup map
        const moodMap = new Map<string, MoodLog>()
        moodHistory.forEach(entry => {
            const dateStr =
                entry.logged_date || entry.logged_at?.split('T')[0] || ''
            if (dateStr) {
                moodMap.set(dateStr, entry)
            }
        })

        // Build calendar grid
        const weeks: Array<
            Array<{
                day: number | null
                dateStr: string
                mood: MoodLog | null
            }>
        > = []
        let currentWeek: (typeof weeks)[0] = []

        // Padding for first week
        for (let i = 0; i < startDayOfWeek; i++) {
            currentWeek.push({ day: null, dateStr: '', mood: null })
        }

        // Fill in days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            currentWeek.push({
                day,
                dateStr,
                mood: moodMap.get(dateStr) || null,
            })

            if (currentWeek.length === 7) {
                weeks.push(currentWeek)
                currentWeek = []
            }
        }

        // Padding for last week
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push({ day: null, dateStr: '', mood: null })
            }
            weeks.push(currentWeek)
        }

        return weeks
    }, [currentMonth, moodHistory])

    const monthName = currentMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    })

    // Use local date formatting to avoid UTC timezone issues
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    return (
        <div className={cn('rounded-xl bg-white p-4 shadow-sm', className)}>
            <h3 className="mb-4 text-center text-sm font-medium text-gray-700">
                {monthName}
            </h3>

            {/* Day headers */}
            <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div
                        key={day}
                        className="text-xs font-medium text-gray-500">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="space-y-1">
                {calendarData.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-1">
                        {week.map((dayData, dayIndex) => (
                            <div
                                key={dayIndex}
                                className={cn(
                                    'relative flex h-9 items-center justify-center rounded-lg text-sm',
                                    dayData.day === null && 'invisible',
                                    dayData.dateStr === today &&
                                        'ring-2 ring-primary ring-offset-1',
                                    dayData.mood
                                        ? cn(
                                              MOOD_BG_COLORS[
                                                  dayData.mood
                                                      .mood as MoodTypeValue
                                              ],
                                              'text-white',
                                          )
                                        : 'bg-gray-100 text-gray-600',
                                )}
                                title={
                                    dayData.mood
                                        ? `${dayData.mood.mood.replace('_', ' ')}${dayData.mood.note ? `: ${dayData.mood.note}` : ''}`
                                        : undefined
                                }>
                                {dayData.mood ? (
                                    <span className="text-base">
                                        {
                                            MOOD_EMOJIS[
                                                dayData.mood
                                                    .mood as MoodTypeValue
                                            ]
                                        }
                                    </span>
                                ) : (
                                    dayData.day
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
                {Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => (
                    <div
                        key={mood}
                        className={cn(
                            'flex items-center gap-1 rounded-full px-2 py-0.5',
                            MOOD_BG_COLORS[mood as MoodTypeValue],
                        )}>
                        <span className="text-sm">{emoji}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
