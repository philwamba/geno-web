'use client'

import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    icon?: ReactNode
    children: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, icon, id, children, ...props }, ref) => {
        const selectId = id || props.name

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {icon}
                        </div>
                    )}
                    <select
                        ref={ref}
                        id={selectId}
                        className={cn(
                            'w-full appearance-none rounded-lg border border-gray-200 px-4 py-2.5 pr-10 transition-colors',
                            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                            'disabled:cursor-not-allowed disabled:bg-gray-50',
                            icon && 'pl-10',
                            error &&
                                'border-red-300 focus:border-red-400 focus:ring-red-200',
                            className,
                        )}
                        {...props}
                    >
                        {children}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    },
)

Select.displayName = 'Select'
