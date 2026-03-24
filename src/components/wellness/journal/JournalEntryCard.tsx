'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { toast } from 'sonner'
import { MOOD_EMOJIS, type MoodTypeValue } from '@/lib/validations/wellness'
import type { JournalEntry } from '@/types'
import { FiEdit2, FiTrash2, FiMoreVertical, FiCalendar } from 'react-icons/fi'
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

interface JournalEntryCardProps {
    entry: JournalEntry
    className?: string
    showActions?: boolean
    compact?: boolean
    onClick?: () => void
}

export function JournalEntryCard({
    entry,
    className,
    showActions = true,
    compact = false,
    onClick,
}: JournalEntryCardProps) {
    const router = useRouter()
    const { deleteJournalEntry, isJournalLoading } = useWellnessStore()
    const [showMenu, setShowMenu] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const mood = entry.mood as MoodTypeValue | undefined
    const emoji = mood ? MOOD_EMOJIS[mood] : null

    const handleDelete = useCallback(async () => {
        try {
            await deleteJournalEntry(entry.id)
            toast.success('Journal entry deleted')
            setShowDeleteDialog(false)
        } catch {
            toast.error('Failed to delete entry')
        }
    }, [deleteJournalEntry, entry.id])

    const handleEdit = useCallback(() => {
        router.push(`/wellness/journal/${entry.id}?edit=true`)
    }, [router, entry.id])

    const handleClick = useCallback(() => {
        if (onClick) {
            onClick()
        } else {
            router.push(`/wellness/journal/${entry.id}`)
        }
    }, [onClick, router, entry.id])

    return (
        <>
            <div
                className={cn(
                    'rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md',
                    onClick || !compact ? 'cursor-pointer' : '',
                    className,
                )}
                onClick={handleClick}>
                {/* Header */}
                <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FiCalendar className="h-3 w-3" />
                        <span>
                            {formatRelativeTime(
                                entry.logged_at || entry.created_at,
                            )}
                        </span>
                        {emoji && <span className="text-base">{emoji}</span>}
                    </div>

                    {showActions && (
                        <div className="relative">
                            <button
                                onClick={e => {
                                    e.stopPropagation()
                                    setShowMenu(!showMenu)
                                }}
                                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                                <FiMoreVertical className="h-4 w-4" />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                                    <button
                                        onClick={e => {
                                            e.stopPropagation()
                                            handleEdit()
                                            setShowMenu(false)
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <FiEdit2 className="h-4 w-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={e => {
                                            e.stopPropagation()
                                            setShowDeleteDialog(true)
                                            setShowMenu(false)
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                        <FiTrash2 className="h-4 w-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                <p
                    className={cn(
                        'text-sm text-gray-700',
                        compact ? 'line-clamp-2' : 'line-clamp-4',
                    )}>
                    {entry.preview || entry.content}
                </p>

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                        {entry.tags.slice(0, compact ? 3 : 10).map(tag => (
                            <span
                                key={tag}
                                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                #{tag}
                            </span>
                        ))}
                        {compact && entry.tags.length > 3 && (
                            <span className="text-xs text-gray-400">
                                +{entry.tags.length - 3} more
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
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
        </>
    )
}
