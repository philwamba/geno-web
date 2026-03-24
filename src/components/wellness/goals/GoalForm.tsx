'use client'

import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    goalSchema,
    type GoalInput,
    type GoalCategoryValue,
    GOAL_CATEGORY_COLORS,
} from '@/lib/validations/wellness'
import { FiTarget, FiCalendar, FiSave } from 'react-icons/fi'
import {
    FiActivity,
    FiHeart,
    FiDollarSign,
    FiUsers,
    FiBriefcase,
    FiStar,
} from 'react-icons/fi'

interface GoalFormProps {
    className?: string
    onSuccess?: () => void
    onCancel?: () => void
    initialCategory?: GoalCategoryValue
}

const CATEGORIES: Array<{
    value: GoalCategoryValue
    label: string
    icon: React.ReactNode
    description: string
}> = [
    {
        value: 'physical',
        label: 'Physical',
        icon: <FiActivity className="h-5 w-5" />,
        description: 'Fitness, nutrition, sleep',
    },
    {
        value: 'mental',
        label: 'Mental',
        icon: <FiHeart className="h-5 w-5" />,
        description: 'Mindfulness, learning, focus',
    },
    {
        value: 'financial',
        label: 'Financial',
        icon: <FiDollarSign className="h-5 w-5" />,
        description: 'Savings, budgeting, income',
    },
    {
        value: 'social',
        label: 'Social',
        icon: <FiUsers className="h-5 w-5" />,
        description: 'Relationships, community',
    },
    {
        value: 'occupational',
        label: 'Occupational',
        icon: <FiBriefcase className="h-5 w-5" />,
        description: 'Career, skills, work-life',
    },
    {
        value: 'spiritual',
        label: 'Spiritual',
        icon: <FiStar className="h-5 w-5" />,
        description: 'Purpose, gratitude, peace',
    },
]

export function GoalForm({
    className,
    onSuccess,
    onCancel,
    initialCategory,
}: GoalFormProps) {
    const { createGoal, isGoalsLoading } = useWellnessStore()

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<GoalInput>({
        resolver: zodResolver(goalSchema),
        defaultValues: {
            category: initialCategory || 'physical',
            title: '',
            description: '',
            target_value: undefined,
            unit: '',
            start_date: new Date().toISOString().split('T')[0],
            target_date: '',
        },
    })

    const selectedCategory = watch('category')
    const hasTarget = watch('target_value')

    const onSubmit = useCallback(
        async (data: GoalInput) => {
            try {
                await createGoal({
                    category: data.category,
                    title: data.title,
                    description: data.description,
                    target_value: data.target_value,
                    unit: data.unit,
                    start_date: data.start_date,
                    target_date: data.target_date,
                })
                toast.success('Goal created successfully!')
                onSuccess?.()
            } catch {
                toast.error('Failed to create goal. Please try again.')
            }
        },
        [createGoal, onSuccess],
    )

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className={cn('space-y-6', className)}>
            {/* Category Selection */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Category
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => setValue('category', cat.value)}
                            className={cn(
                                'flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all',
                                selectedCategory === cat.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300',
                            )}>
                            <div
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-full text-white',
                                    GOAL_CATEGORY_COLORS[cat.value],
                                )}>
                                {cat.icon}
                            </div>
                            <span className="text-sm font-medium">
                                {cat.label}
                            </span>
                            <span className="text-xs text-gray-500 text-center">
                                {cat.description}
                            </span>
                        </button>
                    ))}
                </div>
                {errors.category && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.category.message}
                    </p>
                )}
            </div>

            {/* Title */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Goal Title
                </label>
                <Input
                    {...register('title')}
                    placeholder="e.g., Run a 5K marathon"
                    error={errors.title?.message}
                    icon={<FiTarget className="h-4 w-4" />}
                />
            </div>

            {/* Description */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description (optional)
                </label>
                <textarea
                    {...register('description')}
                    placeholder="Add more details about your goal..."
                    rows={3}
                    className={cn(
                        'w-full rounded-lg border border-gray-200 bg-white p-3',
                        'text-sm placeholder:text-gray-400',
                        'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                        'resize-none',
                    )}
                />
                {errors.description && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.description.message}
                    </p>
                )}
            </div>

            {/* Target Value & Unit */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Target Value (optional)
                    </label>
                    <Input
                        type="number"
                        {...register('target_value', { valueAsNumber: true })}
                        placeholder="e.g., 10000"
                        error={errors.target_value?.message}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Unit (optional)
                    </label>
                    <Input
                        {...register('unit')}
                        placeholder="e.g., steps, km, $"
                        error={errors.unit?.message}
                        disabled={!hasTarget}
                    />
                </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Start Date
                    </label>
                    <Input
                        type="date"
                        {...register('start_date')}
                        icon={<FiCalendar className="h-4 w-4" />}
                        error={errors.start_date?.message}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Target Date (optional)
                    </label>
                    <Input
                        type="date"
                        {...register('target_date')}
                        icon={<FiCalendar className="h-4 w-4" />}
                        error={errors.target_date?.message}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isGoalsLoading}
                        className="flex-1">
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isGoalsLoading}
                    className="flex-1">
                    <FiSave className="mr-2 h-4 w-4" />
                    Create Goal
                </Button>
            </div>
        </form>
    )
}
