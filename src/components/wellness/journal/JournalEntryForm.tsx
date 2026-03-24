'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { toast } from 'sonner'
import { MoodPicker } from '../mood/MoodPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    journalEntrySchema,
    type JournalEntryInput,
    type MoodTypeValue,
} from '@/lib/validations/wellness'
import { FiX, FiPlus, FiSave } from 'react-icons/fi'

interface JournalEntryFormProps {
    className?: string
    onSuccess?: () => void
    onCancel?: () => void
    initialData?: Partial<JournalEntryInput>
    isEditing?: boolean
    entryId?: number
}

export function JournalEntryForm({
    className,
    onSuccess,
    onCancel,
    initialData,
    isEditing = false,
    entryId,
}: JournalEntryFormProps) {
    const { createJournalEntry, updateJournalEntry, isJournalLoading } =
        useWellnessStore()
    const [selectedMood, setSelectedMood] = useState<MoodTypeValue | null>(
        (initialData?.mood as MoodTypeValue) || null,
    )
    const [tags, setTags] = useState<string[]>(initialData?.tags || [])
    const [tagInput, setTagInput] = useState('')

    // Safety check for edit mode
    if (isEditing && !entryId) {
        console.error(
            'JournalEntryForm: isEditing is true but no entryId provided',
        )
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<JournalEntryInput>({
        resolver: zodResolver(journalEntrySchema),
        defaultValues: {
            content: initialData?.content || '',
        },
    })

    const handleAddTag = useCallback(() => {
        const trimmedTag = tagInput.trim()
        if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
            setTags([...tags, trimmedTag])
            setTagInput('')
        }
    }, [tagInput, tags])

    const handleRemoveTag = useCallback((tagToRemove: string) => {
        setTags(prev => prev.filter(t => t !== tagToRemove))
    }, [])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
            }
        },
        [handleAddTag],
    )

    const onSubmit = useCallback(
        async (data: JournalEntryInput) => {
            try {
                if (isEditing && entryId) {
                    await updateJournalEntry(entryId, {
                        content: data.content,
                        mood: selectedMood || undefined,
                        tags: tags.length > 0 ? tags : undefined,
                    })
                } else {
                    await createJournalEntry(
                        data.content,
                        selectedMood || undefined,
                        tags.length > 0 ? tags : undefined,
                    )
                }
                toast.success(
                    isEditing
                        ? 'Journal entry updated!'
                        : 'Journal entry created!',
                )
                onSuccess?.()
            } catch {
                toast.error('Failed to save journal entry. Please try again.')
            }
        },
        [
            createJournalEntry,
            updateJournalEntry,
            selectedMood,
            tags,
            isEditing,
            entryId,
            onSuccess,
        ],
    )

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className={cn('space-y-4', className)}
        >
            {/* Content */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    What&apos;s on your mind?
                </label>
                <textarea
                    {...register('content')}
                    placeholder="Write your thoughts here..."
                    rows={6}
                    className={cn(
                        'w-full rounded-lg border border-gray-200 bg-white p-3',
                        'text-sm placeholder:text-gray-400',
                        'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                        'resize-none',
                        errors.content && 'border-red-500',
                    )}
                />
                {errors.content && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.content.message}
                    </p>
                )}
            </div>

            {/* Mood Selection */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    How are you feeling? (optional)
                </label>
                <MoodPicker
                    selectedMood={selectedMood}
                    onMoodSelect={setSelectedMood}
                    size="sm"
                />
                {selectedMood && (
                    <button
                        type="button"
                        onClick={() => setSelectedMood(null)}
                        className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                        Clear mood selection
                    </button>
                )}
            </div>

            {/* Tags */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tags (optional)
                </label>
                <div className="flex gap-2">
                    <Input
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a tag"
                        className="flex-1"
                        maxLength={50}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddTag}
                        disabled={!tagInput.trim() || tags.length >= 10}
                    >
                        <FiPlus className="h-4 w-4" />
                    </Button>
                </div>
                {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                            >
                                #{tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-primary/70"
                                >
                                    <FiX className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    {tags.length}/10 tags
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isJournalLoading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isJournalLoading}
                    className="flex-1"
                >
                    <FiSave className="mr-2 h-4 w-4" />
                    {isEditing ? 'Update Entry' : 'Save Entry'}
                </Button>
            </div>
        </form>
    )
}
