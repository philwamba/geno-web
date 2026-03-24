'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { MOOD_EMOJIS, type MoodTypeValue } from '@/lib/validations/wellness'
import { FiSearch, FiX, FiFilter } from 'react-icons/fi'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export interface JournalFiltersState {
    search: string
    mood: MoodTypeValue | null
    dateRange: 'all' | 'today' | 'week' | 'month'
}

interface JournalFiltersProps {
    filters: JournalFiltersState
    onFiltersChange: (filters: JournalFiltersState) => void
    className?: string
}

const DATE_RANGES = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
] as const

export function JournalFilters({
    filters,
    onFiltersChange,
    className,
}: JournalFiltersProps) {
    const [showMoodFilter, setShowMoodFilter] = useState(false)

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onFiltersChange({ ...filters, search: e.target.value })
        },
        [filters, onFiltersChange],
    )

    const handleMoodSelect = useCallback(
        (mood: MoodTypeValue | null) => {
            onFiltersChange({ ...filters, mood })
            setShowMoodFilter(false)
        },
        [filters, onFiltersChange],
    )

    const handleDateRangeChange = useCallback(
        (range: JournalFiltersState['dateRange']) => {
            onFiltersChange({ ...filters, dateRange: range })
        },
        [filters, onFiltersChange],
    )

    const handleClearFilters = useCallback(() => {
        onFiltersChange({ search: '', mood: null, dateRange: 'all' })
    }, [onFiltersChange])

    const hasActiveFilters =
        filters.search || filters.mood || filters.dateRange !== 'all'

    return (
        <div className={cn('space-y-3', className)}>
            {/* Search */}
            <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    value={filters.search}
                    onChange={handleSearchChange}
                    placeholder="Search journal entries..."
                    className="pl-10"
                />
                {filters.search && (
                    <button
                        onClick={() =>
                            onFiltersChange({ ...filters, search: '' })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <FiX className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Mood Filter */}
                <div className="relative">
                    <Button
                        variant={filters.mood ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShowMoodFilter(!showMoodFilter)}>
                        <FiFilter className="mr-1 h-3 w-3" />
                        {filters.mood ? MOOD_EMOJIS[filters.mood] : 'Mood'}
                    </Button>

                    {showMoodFilter && (
                        <div className="absolute left-0 top-full z-10 mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                            <div className="mb-2 flex flex-wrap gap-1">
                                {(
                                    Object.keys(MOOD_EMOJIS) as MoodTypeValue[]
                                ).map(mood => (
                                    <button
                                        key={mood}
                                        onClick={() => handleMoodSelect(mood)}
                                        className={cn(
                                            'flex h-8 w-8 items-center justify-center rounded-full text-lg transition-colors',
                                            filters.mood === mood
                                                ? 'bg-primary/20 ring-2 ring-primary'
                                                : 'bg-gray-100 hover:bg-gray-200',
                                        )}>
                                        {MOOD_EMOJIS[mood]}
                                    </button>
                                ))}
                            </div>
                            {filters.mood && (
                                <button
                                    onClick={() => handleMoodSelect(null)}
                                    className="w-full text-center text-xs text-gray-500 hover:text-gray-700">
                                    Clear mood filter
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Date Range Pills */}
                <div className="flex gap-1">
                    {DATE_RANGES.map(range => (
                        <button
                            key={range.value}
                            onClick={() => handleDateRangeChange(range.value)}
                            className={cn(
                                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                                filters.dateRange === range.value
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                            )}>
                            {range.label}
                        </button>
                    ))}
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={handleClearFilters}
                        className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                        <FiX className="h-3 w-3" />
                        Clear filters
                    </button>
                )}
            </div>
        </div>
    )
}
