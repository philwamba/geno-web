'use client'

import { cn } from '@/lib/utils'
import {
    GOAL_CATEGORY_COLORS,
    type GoalCategoryValue,
} from '@/lib/validations/wellness'
import {
    FiActivity,
    FiHeart,
    FiDollarSign,
    FiUsers,
    FiBriefcase,
    FiStar,
} from 'react-icons/fi'

interface GoalCategoryFilterProps {
    selected: GoalCategoryValue | 'all'
    onSelect: (category: GoalCategoryValue | 'all') => void
    className?: string
    counts?: Record<GoalCategoryValue | 'all', number>
}

const CATEGORIES: Array<{
    value: GoalCategoryValue | 'all'
    label: string
    icon: React.ReactNode
}> = [
    { value: 'all', label: 'All', icon: null },
    {
        value: 'physical',
        label: 'Physical',
        icon: <FiActivity className="h-4 w-4" />,
    },
    { value: 'mental', label: 'Mental', icon: <FiHeart className="h-4 w-4" /> },
    {
        value: 'financial',
        label: 'Financial',
        icon: <FiDollarSign className="h-4 w-4" />,
    },
    { value: 'social', label: 'Social', icon: <FiUsers className="h-4 w-4" /> },
    {
        value: 'occupational',
        label: 'Occupational',
        icon: <FiBriefcase className="h-4 w-4" />,
    },
    {
        value: 'spiritual',
        label: 'Spiritual',
        icon: <FiStar className="h-4 w-4" />,
    },
]

export function GoalCategoryFilter({
    selected,
    onSelect,
    className,
    counts,
}: GoalCategoryFilterProps) {
    return (
        <div
            className={cn(
                'flex gap-2 overflow-x-auto pb-2 scrollbar-hide',
                className,
            )}>
            {CATEGORIES.map(cat => {
                const count = counts?.[cat.value]
                const isSelected = selected === cat.value
                const color =
                    cat.value !== 'all'
                        ? GOAL_CATEGORY_COLORS[cat.value as GoalCategoryValue]
                        : 'bg-gray-500'

                return (
                    <button
                        key={cat.value}
                        onClick={() => onSelect(cat.value)}
                        className={cn(
                            'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
                            isSelected
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                        )}>
                        {cat.icon && (
                            <span
                                className={cn(
                                    'flex h-5 w-5 items-center justify-center rounded-full',
                                    isSelected ? 'bg-white/20' : color,
                                    !isSelected && 'text-white',
                                )}>
                                {cat.icon}
                            </span>
                        )}
                        <span>{cat.label}</span>
                        {count !== undefined && (
                            <span
                                className={cn(
                                    'rounded-full px-1.5 text-xs',
                                    isSelected
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-200 text-gray-600',
                                )}>
                                {count}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
