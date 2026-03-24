'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    goalProgressSchema,
    type GoalProgressInput,
} from '@/lib/validations/wellness'
import type { Goal } from '@/types'
import { FiPlus, FiMinus, FiTrendingUp } from 'react-icons/fi'

interface GoalProgressTrackerProps {
    goal: Goal
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function GoalProgressTracker({
    goal,
    open,
    onOpenChange,
    onSuccess,
}: GoalProgressTrackerProps) {
    const { updateGoalProgress, isGoalsLoading } = useWellnessStore()
    const [mode, setMode] = useState<'add' | 'set'>('add')

    const currentValue = goal.current_value || 0
    const targetValue = goal.target_value || 0
    const progress = goal.progress_percentage || 0

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<GoalProgressInput>({
        resolver: zodResolver(goalProgressSchema),
        defaultValues: { value: 0 },
    })

    const inputValue = watch('value')

    const handleQuickAdd = useCallback(
        (amount: number) => {
            const newValue =
                mode === 'add' ? (inputValue || 0) + amount : amount
            setValue('value', Math.max(0, newValue))
        },
        [mode, inputValue, setValue],
    )

    const onSubmit = useCallback(
        async (data: GoalProgressInput) => {
            try {
                const newProgress =
                    mode === 'add' ? currentValue + data.value : data.value

                await updateGoalProgress(goal.id, newProgress)
                toast.success('Progress updated!')
                reset()
                onOpenChange(false)
                onSuccess?.()
            } catch {
                toast.error('Failed to update progress. Please try again.')
            }
        },
        [
            mode,
            currentValue,
            updateGoalProgress,
            goal.id,
            reset,
            onOpenChange,
            onSuccess,
        ],
    )

    const safeInputValue = Number.isNaN(inputValue) ? 0 : inputValue || 0
    const previewProgress =
        mode === 'add'
            ? currentValue + safeInputValue
            : safeInputValue || currentValue
    const previewPercentage =
        targetValue > 0
            ? Math.min(100, (previewProgress / targetValue) * 100)
            : 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Progress</DialogTitle>
                    <DialogDescription>{goal.title}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Current Progress Display */}
                    <div className="rounded-lg bg-gray-50 p-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                                Current Progress
                            </span>
                            <span className="font-medium">
                                {currentValue} / {targetValue} {goal.unit}
                            </span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                        <div className="mt-1 text-right text-xs text-gray-500">
                            {Math.round(progress)}%
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setMode('add')}
                            className={cn(
                                'flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-colors',
                                mode === 'add'
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300',
                            )}
                        >
                            <FiPlus className="mr-1 inline h-4 w-4" />
                            Add to current
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('set')}
                            className={cn(
                                'flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-colors',
                                mode === 'set'
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300',
                            )}
                        >
                            <FiTrendingUp className="mr-1 inline h-4 w-4" />
                            Set total
                        </button>
                    </div>

                    {/* Value Input */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            {mode === 'add' ? 'Add Amount' : 'New Total'}
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleQuickAdd(-1)}
                                disabled={inputValue === 0}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                            >
                                <FiMinus className="h-4 w-4" />
                            </button>
                            <Input
                                type="number"
                                {...register('value', { valueAsNumber: true })}
                                className="flex-1 text-center"
                                error={errors.value?.message}
                            />
                            <button
                                type="button"
                                onClick={() => handleQuickAdd(1)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                                <FiPlus className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="mt-1 text-center text-xs text-gray-500">
                            {goal.unit}
                        </p>
                    </div>

                    {/* Quick Add Buttons (for add mode) */}
                    {mode === 'add' && (
                        <div className="flex flex-wrap justify-center gap-2">
                            {[10, 50, 100, 500, 1000].map(amount => (
                                <button
                                    key={amount}
                                    type="button"
                                    onClick={() => handleQuickAdd(amount)}
                                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                                >
                                    +{amount}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Preview */}
                    {safeInputValue > 0 && (
                        <div className="rounded-lg bg-primary/5 p-3">
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    New Progress
                                </span>
                                <span className="font-medium text-primary">
                                    {previewProgress} / {targetValue}{' '}
                                    {goal.unit}
                                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{
                                        width: `${Math.min(previewPercentage, 100)}%`,
                                    }}
                                />
                            </div>
                            <div className="mt-1 text-right text-xs text-primary">
                                {Math.round(previewPercentage)}%
                                {previewPercentage >= 100 &&
                                    ' - Goal Complete!'}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isGoalsLoading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isGoalsLoading || !inputValue}
                            className="flex-1"
                        >
                            Update Progress
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
