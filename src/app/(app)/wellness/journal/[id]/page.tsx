'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { JournalEntryForm } from '@/components/wellness/journal'
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
import { MOOD_EMOJIS, type MoodTypeValue } from '@/lib/validations/wellness'
import type { JournalEntry } from '@/types'
import { FiCalendar, FiEdit2, FiTrash2 } from 'react-icons/fi'

export default function JournalEntryDetailPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const {
        journalEntries,
        fetchJournalEntries,
        deleteJournalEntry,
        isJournalLoading,
    } = useWellnessStore()

    const entryId = Number(params.id)
    const isValidId = !Number.isNaN(entryId) && entryId > 0
    const isEditMode = searchParams.get('edit') === 'true'

    const [entry, setEntry] = useState<JournalEntry | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isEditing, setIsEditing] = useState(isEditMode)

    const [hasFetchedEntries, setHasFetchedEntries] = useState(false)

    useEffect(() => {
        if (!isValidId) return

        if (
            !hasFetchedEntries &&
            journalEntries.length === 0 &&
            !isJournalLoading
        ) {
            Promise.resolve(fetchJournalEntries()).finally(() =>
                setHasFetchedEntries(true),
            )
        } else if (journalEntries.length > 0) {
            setHasFetchedEntries(true)
        }
    }, [
        isValidId,
        journalEntries.length,
        fetchJournalEntries,
        isJournalLoading,
        hasFetchedEntries,
    ])

    useEffect(() => {
        if (isValidId) {
            const found = journalEntries.find(e => e.id === entryId)
            setEntry(found || null)
        }
    }, [isValidId, journalEntries, entryId])

    const handleDelete = useCallback(async () => {
        try {
            await deleteJournalEntry(entryId)
            toast.success('Journal entry deleted')
            router.push('/wellness/journal')
        } catch {
            toast.error('Failed to delete entry')
        }
    }, [deleteJournalEntry, entryId, router])

    const handleEditSuccess = useCallback(() => {
        setIsEditing(false)
        fetchJournalEntries()
    }, [fetchJournalEntries])

    if (!isValidId || (!entry && hasFetchedEntries && !isJournalLoading)) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <AppHeader
                    title="Journal Entry"
                    showBack
                    onBack={() => router.push('/wellness/journal')}
                />
                <main className="flex h-64 items-center justify-center p-4">
                    <p className="text-gray-500">
                        {!isValidId ? 'Invalid entry ID' : 'Entry not found'}
                    </p>
                </main>
            </div>
        )
    }

    if (!entry) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <AppHeader
                    title="Journal Entry"
                    showBack
                    onBack={() => router.push('/wellness/journal')}
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

    const mood = entry.mood as MoodTypeValue | undefined
    const emoji = mood ? MOOD_EMOJIS[mood] : null

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppHeader
                title={isEditing ? 'Edit Entry' : 'Journal Entry'}
                showBack
                onBack={() =>
                    isEditing
                        ? setIsEditing(false)
                        : router.push('/wellness/journal')
                }
            />

            <main className="p-4">
                {isEditing ? (
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                        <JournalEntryForm
                            initialData={{
                                content: entry.content,
                                mood: entry.mood as MoodTypeValue,
                                tags: entry.tags,
                            }}
                            isEditing
                            entryId={entry.id}
                            onSuccess={handleEditSuccess}
                            onCancel={() => setIsEditing(false)}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Entry Content */}
                        <div className="rounded-xl bg-white p-4 shadow-sm">
                            {/* Header */}
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <FiCalendar className="h-4 w-4" />
                                    <span>
                                        {formatDate(
                                            entry.logged_at || entry.created_at,
                                        )}
                                    </span>
                                    <span className="text-xs">
                                        (
                                        {formatRelativeTime(
                                            entry.logged_at || entry.created_at,
                                        )}
                                        )
                                    </span>
                                </div>
                                {emoji && (
                                    <span className="text-2xl">{emoji}</span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="prose prose-sm max-w-none">
                                <p className="whitespace-pre-wrap text-gray-700">
                                    {entry.content}
                                </p>
                            </div>

                            {/* Tags */}
                            {entry.tags && entry.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                                    {entry.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(true)}
                                className="flex-1">
                                <FiEdit2 className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteDialog(true)}
                                className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700">
                                <FiTrash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            {/* Delete Confirmation */}
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete Journal Entry
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this journal entry?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isJournalLoading}
                            className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
