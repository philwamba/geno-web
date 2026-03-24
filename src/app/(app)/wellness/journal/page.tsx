'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { AppHeader } from '@/components/layout/app-header'
import {
    JournalEntryCard,
    JournalFilters,
    type JournalFiltersState,
} from '@/components/wellness/journal'
import { Button } from '@/components/ui/button'
import { FiPlus, FiBook, FiEdit3 } from 'react-icons/fi'

export default function JournalPage() {
    const router = useRouter()
    const { journalEntries, fetchJournalEntries, isJournalLoading } =
        useWellnessStore()

    const [filters, setFilters] = useState<JournalFiltersState>({
        search: '',
        mood: null,
        dateRange: 'all',
    })

    useEffect(() => {
        fetchJournalEntries()
    }, [fetchJournalEntries])

    // Filter entries
    const filteredEntries = useMemo(() => {
        let filtered = [...journalEntries]

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(
                entry =>
                    entry.content.toLowerCase().includes(searchLower) ||
                    entry.tags?.some(tag =>
                        tag.toLowerCase().includes(searchLower),
                    ),
            )
        }

        // Mood filter
        if (filters.mood) {
            filtered = filtered.filter(entry => entry.mood === filters.mood)
        }

        // Date filter
        const now = new Date()
        if (filters.dateRange === 'today') {
            const today = now.toISOString().split('T')[0]
            filtered = filtered.filter(
                entry =>
                    entry.logged_date === today ||
                    entry.logged_at?.startsWith(today),
            )
        } else if (filters.dateRange === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            filtered = filtered.filter(
                entry =>
                    new Date(entry.logged_at || entry.created_at) >= weekAgo,
            )
        } else if (filters.dateRange === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            filtered = filtered.filter(
                entry =>
                    new Date(entry.logged_at || entry.created_at) >= monthAgo,
            )
        }

        return filtered
    }, [journalEntries, filters])

    const handleNewEntry = useCallback(() => {
        router.push('/wellness/journal/new')
    }, [router])

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppHeader
                title="Journal"
                showBack
                onBack={() => router.push('/wellness')}
                rightContent={
                    <button
                        onClick={handleNewEntry}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white"
                    >
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
                                <FiBook className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">
                                    Total Entries
                                </p>
                                <p className="text-xl font-bold text-gray-900">
                                    {journalEntries.length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div
                        onClick={handleNewEntry}
                        className="cursor-pointer rounded-xl bg-primary/5 p-4 shadow-sm transition-all hover:bg-primary/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                                <FiEdit3 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-primary">
                                    New Entry
                                </p>
                                <p className="text-xs text-primary/70">
                                    Write your thoughts
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filters */}
                <section>
                    <JournalFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                </section>

                {/* Entries List */}
                <section>
                    <p className="mb-2 text-xs text-gray-500">
                        {filteredEntries.length} entries
                    </p>

                    {isJournalLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className="h-24 animate-pulse rounded-xl bg-gray-200"
                                />
                            ))}
                        </div>
                    ) : filteredEntries.length === 0 ? (
                        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                            <FiBook className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                            <p className="mb-2 text-sm font-medium text-gray-600">
                                {filters.search || filters.mood
                                    ? 'No entries match your filters'
                                    : 'No journal entries yet'}
                            </p>
                            <p className="mb-4 text-xs text-gray-400">
                                {filters.search || filters.mood
                                    ? 'Try adjusting your filters'
                                    : 'Start writing to capture your thoughts'}
                            </p>
                            {!filters.search && !filters.mood && (
                                <Button onClick={handleNewEntry} size="sm">
                                    <FiPlus className="mr-1 h-4 w-4" />
                                    Create Entry
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredEntries.map(entry => (
                                <JournalEntryCard
                                    key={entry.id}
                                    entry={entry}
                                    compact
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
