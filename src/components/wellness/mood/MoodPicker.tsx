'use client'

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { MOOD_EMOJIS, type MoodTypeValue } from '@/lib/validations/wellness'

interface MoodPickerProps {
    selectedMood?: MoodTypeValue | null
    onMoodSelect: (mood: MoodTypeValue) => void
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg'
    showLabels?: boolean
}

const MOOD_LABELS: Record<MoodTypeValue, string> = {
    very_happy: 'Very Happy',
    happy: 'Happy',
    neutral: 'Neutral',
    sad: 'Sad',
    anxious: 'Anxious',
    tired: 'Tired',
    angry: 'Angry',
}

const SIZE_CLASSES = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-14 h-14 text-3xl',
}

export function MoodPicker({
    selectedMood,
    onMoodSelect,
    disabled = false,
    size = 'md',
    showLabels = false,
}: MoodPickerProps) {
    const moods = Object.keys(MOOD_EMOJIS) as MoodTypeValue[]

    const handleSelect = useCallback(
        (mood: MoodTypeValue) => {
            if (!disabled) {
                onMoodSelect(mood)
            }
        },
        [disabled, onMoodSelect],
    )

    return (
        <div className="flex flex-wrap justify-center gap-2">
            {moods.map(mood => (
                <div key={mood} className="flex flex-col items-center">
                    <button
                        type="button"
                        onClick={() => handleSelect(mood)}
                        disabled={disabled}
                        aria-label={`Select ${MOOD_LABELS[mood]} mood`}
                        className={cn(
                            'flex items-center justify-center rounded-full transition-all duration-200',
                            SIZE_CLASSES[size],
                            selectedMood === mood
                                ? 'bg-primary/20 ring-2 ring-primary scale-110 shadow-md'
                                : 'bg-gray-100 hover:bg-gray-200 hover:scale-105',
                            disabled && 'opacity-50 cursor-not-allowed',
                        )}>
                        {MOOD_EMOJIS[mood]}
                    </button>
                    {showLabels && (
                        <span
                            className={cn(
                                'mt-1 text-xs',
                                selectedMood === mood
                                    ? 'text-primary font-medium'
                                    : 'text-gray-500',
                            )}>
                            {MOOD_LABELS[mood]}
                        </span>
                    )}
                </div>
            ))}
        </div>
    )
}
