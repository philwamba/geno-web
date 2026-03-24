'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { toast } from 'sonner'
import { MoodPicker } from './MoodPicker'
import { Button } from '@/components/ui/button'
import {
    moodLogSchema,
    type MoodLogInput,
    type MoodTypeValue,
    MOOD_EMOJIS,
} from '@/lib/validations/wellness'
import { FiMessageCircle, FiCheck, FiX } from 'react-icons/fi'

interface MoodCheckInCardProps {
    className?: string
    compact?: boolean
    onSuccess?: (pointsEarned: number) => void
}

export function MoodCheckInCard({
    className,
    compact = false,
    onSuccess,
}: MoodCheckInCardProps) {
    const { todayMood, logMood, isMoodLoading } = useWellnessStore()
    const [showNoteInput, setShowNoteInput] = useState(false)
    const [selectedMood, setSelectedMood] = useState<MoodTypeValue | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<MoodLogInput>({
        resolver: zodResolver(moodLogSchema),
    })

    const handleMoodSelect = useCallback((mood: MoodTypeValue) => {
        setSelectedMood(mood)
        setShowNoteInput(true)
    }, [])

    const handleCancel = useCallback(() => {
        setSelectedMood(null)
        setShowNoteInput(false)
        reset()
    }, [reset])

    const onSubmit = useCallback(
        async (data: MoodLogInput) => {
            if (!selectedMood) return

            try {
                const result = await logMood(selectedMood, data.note)
                toast.success(`Mood logged! +${result.points_earned} points`)
                onSuccess?.(result.points_earned)
                handleCancel()
            } catch {
                toast.error('Failed to log mood. Please try again.')
            }
        },
        [selectedMood, logMood, onSuccess, handleCancel],
    )

    const handleQuickSubmit = useCallback(async () => {
        if (!selectedMood) return

        try {
            const result = await logMood(selectedMood)
            toast.success(`Mood logged! +${result.points_earned} points`)
            onSuccess?.(result.points_earned)
            handleCancel()
        } catch {
            toast.error('Failed to log mood. Please try again.')
        }
    }, [selectedMood, logMood, onSuccess, handleCancel])

    // If mood already logged today, show current mood
    if (todayMood) {
        return (
            <div className={cn('rounded-xl bg-white p-4 shadow-sm', className)}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-700">
                            Today&apos;s Mood
                        </h3>
                        <p className="text-xs text-gray-500">
                            Already checked in today
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">
                            {MOOD_EMOJIS[todayMood.mood as MoodTypeValue]}
                        </span>
                        <FiCheck className="h-4 w-4 text-green-500" />
                    </div>
                </div>
                {todayMood.note && (
                    <p className="mt-2 text-sm text-gray-600 italic">
                        &quot;{todayMood.note}&quot;
                    </p>
                )}
            </div>
        )
    }

    return (
        <div className={cn('rounded-xl bg-white p-4 shadow-sm', className)}>
            <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                    How are you feeling?
                </h3>
                {!compact && (
                    <p className="text-xs text-gray-500">
                        Tap an emoji to log your mood
                    </p>
                )}
            </div>

            {!showNoteInput ? (
                <MoodPicker
                    selectedMood={selectedMood}
                    onMoodSelect={handleMoodSelect}
                    disabled={isMoodLoading}
                    size={compact ? 'sm' : 'md'}
                />
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <div className="flex items-center justify-center gap-2 py-2">
                        <span className="text-4xl">
                            {MOOD_EMOJIS[selectedMood!]}
                        </span>
                    </div>

                    <div>
                        <div className="relative">
                            <FiMessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <textarea
                                {...register('note')}
                                placeholder="Add a note (optional)"
                                rows={2}
                                className={cn(
                                    'w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3',
                                    'text-sm placeholder:text-gray-400',
                                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                                    'resize-none',
                                )}
                            />
                        </div>
                        {errors.note && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.note.message}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            disabled={isMoodLoading}
                            className="flex-1">
                            <FiX className="mr-1 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleQuickSubmit}
                            disabled={isMoodLoading}
                            className="flex-1">
                            Skip Note
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isMoodLoading}
                            className="flex-1">
                            <FiCheck className="mr-1 h-4 w-4" />
                            Save
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
}
